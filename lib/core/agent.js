const Base = require('sdk-base');
const Runner = require('./runner');
const reporters = require('./reporter');
const fs = require('mz/fs');
const path = require('path');
const DEFAULT_INTERVAL = 1 * 1000;


class Agent extends Base {
    constructor(options) {
        super(Object.assign({initMethod: '_init'}, options));
    }

    async _init() {
        const options = this.options;

        this._runners = new Map();

        for (let [name, file] of Object.entries(options.files)) {
            this._runners.set(name, new Runner({
                name,
                file,
                rundir: options.rundir,
                logger: console
            }));
        }

        const { orders } = options;

        const list = (await fs.readdir(path.join(__dirname, 'orders'))).map(filename => path.join(__dirname, 'orders', filename));

        this.orders = [...orders, ...list].map(file => Object.assign(require(file), {
            file
        }));

        this.orderResults = [];

        for (let order of this.orders) {
            setInterval(async () => {
                this.orderResults[order.file] = await order.getMetric(this.options);
            }, order.interval || DEFAULT_INTERVAL);
        }
        

        this.reporter = [];

        for (let reporter of options.reporter) {
            const Reporter = reporters[reporter];
            const rpt = new Reporter(options);

            this.reporter.push(rpt);
        }

        setInterval(async() => {
            let result = await this.collect();
            result = [
                ...result,
                ...Object.values(this.orderResults)
            ];

            for (let reporter of this.reporter) {
                reporter.report(result);
            }
        }, DEFAULT_INTERVAL);
    }

    async collect() {
        const promises = [];

        for (let [, runner] of this._runners) {
            promises.push(
                runner.start()
            );
        }

        const results = await Promise.all(promises);

        return results;
    }
}

module.exports = Agent;