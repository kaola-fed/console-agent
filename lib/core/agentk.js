const Base = require('sdk-base');
const reporters = require('./reporter');
const fs = require('mz/fs');
const path = require('path');
const assert = require('assert');
const clearIntervals = require('@segment/clear-intervals');
const DEFAULT_INTERVAL = 60 * 1000;


class Agent extends Base {
    constructor(options) {
        assert(options.rundir, 'options.rundir is required');
        
        super(Object.assign({initMethod: '_init'}, options));
        this.options.logger = console;
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
            if (task.interval) {
                setInterval(async () => {
                    this.taskResultsCache[task.file] = await task.getMetric(this.options);
                }, task.interval)
            } else {
                this.defaultIntervalTasks.push(task);
            }
        }

        this.reporter = [];

        for (let reporter of (options.reporter || [])) {
            const Reporter = reporters[reporter];
            const rpt = new Reporter(options);

            this.reporter.push(rpt);
        }

        setInterval(async() => {
            let result = await this.collect();

            result = [
                ...result,
                ...Object.values(this.taskResultsCache)
            ];

            this.taskResultsCache.length = 0;

            for (let reporter of this.reporter) {
                reporter.report(result);
            }
        }, DEFAULT_INTERVAL)
    }

    stop() {
        clearIntervals();
    }

    async collect(tasks = this.defaultIntervalTasks) {
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

module.exports = Agent;