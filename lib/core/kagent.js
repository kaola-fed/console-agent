const ready = require('../utils/ready');
const Base = require('sdk-base');
const Probe = require('./probe');
const pid = process.pid;
const sum = (list) => {
  return list.reduce((total, item) => {
    return total + item;
  }, 0)
}

class Kagent extends Base {
  constructor(options) {
    super(options);

    this.state = {};
    this._logs = [];
    this.isMaster = null;

    this.probe = new Probe({
      logger: this.logger
    });

    this.metrics = {
      counter: {},
      histogram: {},
      meter: {},
      guage: {},
    };
  }

  get logger() {
    return this.options.logger || console;
  }

  log(data = {}) {
    // this.logger.info(data);
    this._logs.push({
      data,
      pid,
      id: this.state.id,
      timestamp: Date.now()
    });
  }

  install({
    client, isMaster
  }) {
    this.isMaster = isMaster;

    this.client = client;
    this.state = client.state;

    this.client.on('syncState', ({data}) => {
      this.state = data;
      this.probe.restart(data)
    });

    setInterval(async() => {
      try {
        this.client.sendToLeader('logs', this._logs)
        this._logs.length = 0;
      } catch(e) {
        this.logger.error(e);
      }
    }, 1000);

    this.probe.start(this.state.cron);

    ready(true, this);
    this.startTask();
  }

  startTask() {
    let time = Date.now();
    const metrics = this.metrics;

    this.probe.addTask(async () => {
      const now = Date.now();
      const duration = now - time;
      time = now;

      Object.entries(metrics).forEach(([type, data]) => {
        Object.entries(data).forEach(async([name, value]) => {
          let val;

          if (type === 'guage') {
            val = await value();
          } else if (type === 'histogram') {
            if (value.length !== 0) {
              val = {
                min: Reflect.apply(Math.min, undefined, value),
                max: Reflect.apply(Math.max, undefined, value),
                sum: sum(value),
                count: value.length,
              }
              metrics[type][name].length = 0;
            }
          } else if (type === 'meter') {
            if (value !== 0) {
              val = value / duration;
              metrics[type][name] = 0;
            }
          } else if (type === 'counter') {
            val = value;
          }

          if (val) {
            this.log({
              name,
              type,
              value: val
            });
          }
        })
      })
    });
  }

  counter(name) {
    const base = this.metrics.counter;
    base[name] = 0;

    return {
      inc: () => {
        base[name] += 1;
      },
      dec() {
        base[name] -= 1;
      },
    }
  }

  timer(name) {
    const histogram = this.histogram(name);
    const meter = this.meter(name);
    let time;
    
    return {
      start: () => {
        time = Date.now();
      },
      close() {
        const endTime = Date.now() - time;
        histogram.update(endTime);
        meter.mark();
      },
    }
  }

  histogram(name) {
    const base = this.metrics.histogram;
    if (!base[name]) {
      base[name] = [];
    }

    const list = base[name];

    return {
      update: (time) => {
        list.push(time);
      }
    }
  }

  meter(name) {
    const base = this.metrics.meter;
    if (!base[name]) {
      base[name] = 0;
    }

    // this.probe.addTask(() => {
    //   const rate = count / (Date.now() - time);

    //   count = 0;
    //   time = Date.now();

    //   this.log({
    //     name,
    //     type: 'meter',
    //     value: rate
    //   });
    // });
    return {
      mark: () => {
        base[name] += 1;
      }
    }
  }

  guage(name, fn) {
    const base = this.metrics.guage;

    if (!base[name]) {
      base[name] = fn;
    }
  }

  error(error, ctx) {
    if (!error) {
      return;
    }

    const value = {};
    value.name = error.name;
    value.message = error.message;
    value.stack = error.stack;

    if (ctx) {
      value.path = ctx.request.path;
      value.headers = ctx.request.headers;
    }
    
    this.log(value);
  }
}

module.exports = new Kagent();