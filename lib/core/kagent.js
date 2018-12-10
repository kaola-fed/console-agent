const Base = require('sdk-base');
const Probe = require('./probe');
const pid = process.pid;

class Kagent extends Base {
  constructor(options) {
    super(options);

    this.state = {};
    this._logs = [];
    this.isMaster = null;
  }

  get logger() {
    return this.options.logger;
  }

  log(data = {}) {
    this._logs.push({
      data,
      pid,
      id: this.state.id,
      timestamp: Date.now()
    });
  }

  install({
    client
  }) {
    this.client = client;
    this.isMaster = client.isMaster;
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

    this.probe = new Probe({
      logger: this.logger,
      cron: this.state.cron
    });

    this.probe.start();

    this.ready(true);
  }

  counter(name) {
    let count = 0;

    this.probe.addTask(() => {
      this.log({
        name: name,
        type: 'counter',
        operation: 'set',
        value: count
      });
    });

    return {
      inc: () => {
        count += 1;
      },
      dec() {
        count -= 1;
      },
    }
  }

  timer(name) {
    let time;

    return {
      start: () => {
        time = Date.now();
      },
      close() {
        this.log({
          name: name,
          type: 'timer',
          operation: 'update',
          value: Date.now() - time
        });
      },
    }
  }

  histogram(name) {
    return {
      update: (time) => {
        this.log({
          name: name,
          type: 'histogram',
          operation: 'update',
          value: time
        });
      }
    }
  }

  meter(name) {
    return {
      update: () => {
        this.log({
          name: name,
          type: 'meter',
          operation: 'mark'
        });
      }
    }
  }

  guage(name, fn) {
    this.probe.addTask(async () => {
      this.log({
        name,
        type: 'guage',
        operation: 'set', 
        value: await fn()
      });
    });
  }
}

module.exports = new Kagent();