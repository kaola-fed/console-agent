const Base = require('sdk-base');
const fs = require('mz/fs');
const path = require('path');
const DEFAULT_CRON = '* * * * * *';
const CronJob = require('cron').CronJob;


class Task extends Base {
  constructor(options) {
    options.logger = options.logger || console;
    options.cron = options.cron || DEFAULT_CRON;

    super(Object.assign({initMethod: '_init'}, options));

    this.job = null;
  }

  get logger() {
    return this.options.logger;
  }

  async onTaskDone() {
    
  }

  async _init() {
    const options = this.options;

    this._runners = new Map();

    const { tasks = [] } = options;

    const list = (await fs.readdir(path.join(__dirname, '../tasks'))).map(filename => path.join(__dirname, '../tasks', filename));

    this.tasks = [...tasks, ...list].map(file => Object.assign(require(file), {
      file
    }));
  }

  start() {
    const job = new CronJob(this.options.cron, async() => {
      try {
        await this.doTasks();
        await this.onTaskDone();
      } catch(e) {
        this.logger.error(e);
      }
    }, null, true, 'America/Los_Angeles');

    job.start();

    this.job = job;
  }

  async doTasks() {
    const promises = [];

    for (let task of this.tasks) {
      promises.push(
        task.doTask(this.options)
      );
    }

    try {
      (await Promise.all(promises)).filter(item => item);
    } catch(e) {
      this.logger.error('[kagent] 采集阶段发生异常,', e);
    }
  }

  stop() {
    this.job.stop();
  }

  restart() {
    this.stop();
    this.start();
  }
}

module.exports = Task;