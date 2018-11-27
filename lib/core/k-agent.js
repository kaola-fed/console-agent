const Base = require('sdk-base');
const Task = require('./task');
const pid = process.pid;
class KAgent extends Base {
  constructor(options) {
    super(options);

    this.state = {};
    this._logs = [];
  }

  get logger() {
    return this.options.logger;
  }

  pLog(data) {
    data.pid = pid;
    return this.log(data);
  }

  log(data) {
    this._logs.push(data);
  }

  init(client) {
    this.client = client;
    this.client.on('syncState', ({data}) => {
      this.state = data;
    });
    this.log = (data) => this.client.sendToLeader('log', data);

    this.task = new Task({
      logger: this.logger,
      cron: this.state.cron
    });

    this.task.start();
  }

  counter(name) {
    return {
      inc: () => {
        this.log([name, 'counter', 'inc']);
      },
      dec() {
        this.log([name, 'counter', 'dec']);
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
        this.log([name, 'timer', 'update', Date.now() - time]);
      },
    }
  }

  histogram(name) {
    return {
      update: () => {
        this.log([name, 'histogram', 'update']);
      }
    }
  }

  meter(name) {
    return {
      update: () => {
        this.log([name, 'meter', 'mark']);
      }
    }
  }

  guage(name, fn) {
    this.task.onTaskDone = async () => {
      this.log([name, 'guage', 'set', await fn()]);
    };
  }

}

module.exports = new KAgent();