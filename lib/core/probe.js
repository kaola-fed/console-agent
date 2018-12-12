const Base = require('sdk-base');
const fs = require('mz/fs');
const nativeFs = require('fs');
const path = require('path');
const DEFAULT_CRON = '* * * * * *';
const CronJob = require('cron').CronJob;


module.exports = class Probe extends Base {
  constructor(options) {
    options.logger = options.logger || console;
    options.cron = options.cron || DEFAULT_CRON;

    super(options);

    this.job = null;
    this.tasks = [];

    this._runners = new Map();

    const { tasks = [] } = options;

    const list = (nativeFs.readdirSync(path.join(__dirname, '../probes'))).map(filename => path.join(__dirname, '../probes', filename));

    [...tasks, ...list].forEach(
      file => require(file)
    );
  }

  get logger() {
    return this.options.logger;
  }

  async _init() {
    
  }

  start() {
    const job = new CronJob(this.options.cron, async() => {
      try {
        await this.doTasks();
      } catch(e) {
        this.logger.error(e);
      }
    }, null, true, 'America/Los_Angeles');

    job.start();

    this.job = job;
  }

  async doTasks() {
    await Promise.all(
      this.tasks.map(task => task())
    )
  }

  addTask(fn) {
    this.tasks.push(fn);
  }

  stop() {
    this.job.stop();
  }

  restart(data) {
    Object.assign(this.options, data);
    this.stop();
    this.start();
  }
}
