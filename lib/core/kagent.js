const Base = require('sdk-base');
const reporters = require('./reporter');
const fs = require('mz/fs');
const path = require('path');
const assert = require('assert');
const clearIntervals = require('@segment/clear-intervals');
const DEFAULT_CRON = '30 * * * * *';
const CronJob = require('cron').CronJob;


class KAgent extends Base {
    constructor(options) {
        assert(options.name, 'options.name is required');
        assert(options.rundir, 'options.rundir is required');
        options.logger = options.logger || console;
        
        super(Object.assign({initMethod: '_init'}, options));

        this.cron = [];
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

        this.aloneTaskResults = {};

        this.doTaskBeforeCollect = [];

        for (let task of this.tasks) {
            if (task.cron && task.cron !== DEFAULT_CRON) {
                const job = new CronJob(task.cron, async () => {
                    try {
                        const results = await task.doTask(this.options);
                        if (results) {
                            this.aloneTaskResults[task.file] = results;
                        }
                    } catch(e) {
                        this.logger.error(e);
                    }
                });
                job.start();
                this.cron.push(job);
            } else {
                this.doTaskBeforeCollect.push(task);
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
            this.logger.info('[kagent] 开始采集');
            try {
                const results = await this.collect();
                this.logger.info('[kagent] 采集完毕，准备上报');
                await this.report(results);
                this.logger.info('[kagent] 上报成功');
            } catch(e) {
                this.logger.error(e);
            }
        }, null, true, 'America/Los_Angeles');

        job.start();

        this.cron.push(job);
    }

    stop() {
        clearIntervals();
        this.cron.forEach(cron => cron.stop());
    }

    async report(results) {
        const promises = this.reporter.map(reporter => reporter.report(results));
        let rs = [];

        try {
            rs = await Promise.all(promises);
        } catch(e) {
            this.logger.error('[kagent] 上传阶段发生异常,', e);
        }

        return rs.reduce((prev, item, index) => {
            return Object.assign(prev, {
                [this.reporter[index]._name]: item
            })
        }, {});
    }

    async collect() {
        this.logger.info('[kagent] 开始执行 task');
        let results = await this._collect();
        this.logger.info('[kagent] task 执行完毕');

        results = [
            ...results,
            ...Object.values(this.aloneTaskResults)
        ];

        this.aloneTaskResults = {};

        return results;
    }

    async _collect(tasks = this.doTaskBeforeCollect) {
        const promises = [];

        for (let task of tasks) {
            promises.push(
                task.doTask(this.options)
            );
        }

        let results = [];

        try {
            results = (await Promise.all(promises)).filter(item => item);
        } catch(e) {
            this.logger.error('[kagent] 采集阶段发生异常,', e);
        }

        return results;
    }
}

module.exports = KAgent;