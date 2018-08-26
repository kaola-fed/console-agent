const Base = require('sdk-base');
const reporters = require('./reporter');
const fs = require('mz/fs');
const path = require('path');
const DEFAULT_INTERVAL = 1 * 1000;


class Agent extends Base {
    constructor(options) {
        super(Object.assign({initMethod: '_init'}, options));
        this.options.logger = console;
    }

    async _init() {
        const options = this.options;

        this._runners = new Map();


        const { tasks } = options;

        const list = (await fs.readdir(path.join(__dirname, 'tasks'))).map(filename => path.join(__dirname, 'tasks', filename));

        this.tasks = [...tasks, ...list].map(file => Object.assign(require(file), {
            file
        }));

        this.taskResultsCache = [];

        const defaultIntervalTasks = [];

        for (let task of this.tasks) {
            if (task.interval) {
                defaultIntervalTasks.push(task);
            } else {
                setInterval(async () => {
                    this.taskResultsCache[task.file] = await task.getMetric(this.options);
                }, task.interval);
            }
        }

        this.reporter = [];

        for (let reporter of options.reporter) {
            const Reporter = reporters[reporter];
            const rpt = new Reporter(options);

            this.reporter.push(rpt);
        }

        setInterval(async() => {
            let result = await this.collect(defaultIntervalTasks);

            result = [
                ...result,
                ...Object.values(this.taskResultsCache)
            ];

            this.taskResultsCache.length = 0;

            for (let reporter of this.reporter) {
                reporter.report(result);
            }
        }, DEFAULT_INTERVAL);
    }

    async collect(tasks) {
        const promises = [];

        for (let task of tasks) {
            promises.push(
                task.getMetric()
            );
        }

        const results = await Promise.all(promises);

        return results;
    }
}

module.exports = Agent;