const Base = require('sdk-base');
const reporters = require('./reporter');
const fs = require('mz/fs');
const path = require('path');
const assert = require('assert');
const clearIntervals = require('@segment/clear-intervals');
const DEFAULT_CRON = '* 0 * * * *';
const CronJob = require('cron').CronJob;


class AgentK extends Base {
    constructor(options) {
        assert(options.name, 'options.name is required');
        assert(options.rundir, 'options.rundir is required');
        options.logger = options.logger || console;
        
        super(Object.assign({initMethod: '_init'}, options));
    }

    get logger() {
        return this.options.logger || console;
    }

    async _init() {
        const options = this.options;

        this._runners = new Map();

        const { tasks = [] } = options;

        const list = (await fs.readdir(path.join(__dirname, 'tasks'))).map(filename => path.join(__dirname, 'tasks', filename));

        this.tasks = [...tasks, ...list].map(file => Object.assign(require(file), {
            file
        }));

        this.taskResultsCache = [];

        this.defaultIntervalTasks = [];

        for (let task of this.tasks) {
            if (task.cron) {
                const job = new CronJob(task.cron, async () => {
                    try {
                        this.taskResultsCache[task.file] = await task.getMetric(this.options);
                    } catch(e) {
                        this.logger.error(e);
                    }
                });
                job.start();
            } else {
                this.defaultIntervalTasks.push(task);
            }
        }

        this.reporter = [];

        for (let reporter of (options.reporter || [])) {
            const Reporter = reporters[reporter];
            const rpt = new Reporter(options);

            rpt._name = reporter;

            this.reporter.push(rpt);
        }

        const job = new CronJob(DEFAULT_CRON, async() => {
            try {
                this.report(await this.collect());
            } catch(e) {
                this.logger.error(e);
            }
        }, null, true, 'America/Los_Angeles');

        job.start();
    }

    stop() {
        clearIntervals();
    }

    async report(results) {
        const promises = this.reporter.map(reporter => reporter.report(results));
        const rs = await Promise.all(promises);

        return rs.reduce((prev, item, index) => {
            return Object.assign(prev, {
                [this.reporter[index]._name]: item
            })
        }, {});
    }

    async collect() {
        let results = await this._collect();

        results = [
            ...results,
            ...Object.values(this.taskResultsCache)
        ];

        this.taskResultsCache.length = 0;

        return results;
    }

    async _collect(tasks = this.defaultIntervalTasks) {
        const promises = [];

        for (let task of tasks) {
            promises.push(
                task.getMetric(this.options)
            );
        }

        const results = await Promise.all(promises);

        return results;
    }
}

module.exports = AgentK;