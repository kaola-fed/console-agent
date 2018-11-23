const Base = require('sdk-base');
const path = require('path');
const {createWriteStream} = require('fs');
const fs = require('../../utils/fs');
const { MetrixTypes, CounterMetrixMethods, 
    HistogramMetrixMethods, MeterMethods, 
    TimerMethods, GuageMethods } = require('./types');

class Metric {
    constructor() {
        this.log = [];
    }

    addMetric(...log) {
        this.log.push(log);
    }
}

class Timer extends Metric {
    constructor() {
        super();
        this._time = Date.now();
    }
    [TimerMethods.end]() {
        this.addMetric(MetrixTypes.timer, TimerMethods.update, Date.now() - this._time);
    }
}

class Counter extends Metric {
    constructor() {
        super();
        this._time = Date.now();
    }
    [CounterMetrixMethods.inc](value = 1) {
        this.addMetric(MetrixTypes.counter, CounterMetrixMethods.inc, value);
    }
    [CounterMetrixMethods.dec](value = 1) {
        this.addMetric(MetrixTypes.counter, CounterMetrixMethods.dec, value);
    }
}

class Guage extends Metric {
    [GuageMethods.setValue](value) {
        this.addMetric(MetrixTypes.guage, GuageMethods.setValue, value);
    }
}

class Histogram extends Metric {
    [HistogramMetrixMethods.update](value) {
        this.addMetric(MetrixTypes.histogram, HistogramMetrixMethods.update, value);
    }
}

class Meter extends Metric {
    [MeterMethods.mark]() {
        this.addMetric(MetrixTypes.meter, MeterMethods.mark);
    }
}

class Logger extends Base {
    constructor(options) {
        super(Object.assign({
            initMethod: '_init'
        }, options));
        this._buf = [];
        this._flushing = false;
    }
    
    get flushInterval() {
        return this.options.flushInterval || 1000;
    }

    async _init() {
        await this.reload();

        this._timer = setInterval(() => {
            if (this._needFlush()) {
                this._flush();
            }
        }, this.flushInterval);
    }

    async reload() {
        const file = this.options.file;
        const {dir} = path.parse(file);

        if (!(await fs.exists(dir))) {
            await fs.mkdirp(dir);
        }

        this._stream = createWriteStream(file, { flags: 'a' });
    }

    log(str) {
        this._log(Buffer.from(str));
        this._log(Buffer.from('\n'));
    }

    _log(buf) {
        this._buf.push(buf);
    }

    _needFlush() {
        return this._buf.length > 0 && !this._flushing;
    }

    _flush() {
        this._flushing = true;

        try {
            let buf = Buffer.concat(this._buf);
            this._buf.length = 0;
            this._stream.write(buf);
        } catch(e) {
            this.options.logger.error(e);
        }
        this._flushing = false;
    }

    stop() {
        clearInterval(this._timer);
    }
}

module.exports = class Metrix extends Base {
    constructor(options) {
        super(Object.assign({
            initMethod: '_init'
        }, options));

        options.logger = options.logger || console;

        this._map = new Map();
    }

    getTimer() {
        return new Timer();
    }

    getCounter() {
        return new Counter();
    }

    getGuage() {
        return new Guage();
    }

    getHistogram() {
        return new Histogram();
    }

    getMeter() {
        return new Meter();
    }

    addMetric(scope, metric, tag = 'built-in') {
        const logger = this.loggers.get(tag);

        if (logger) {
            metric.log.forEach((log) => {
                logger.log(JSON.stringify([scope, ...log]));
            })
        }
    }

    // eslint-disable-next-line no-empty-function
    async _init() {
        const options = this.options;

        this.loggers = new Map();

        for (let [name, file] of Object.entries(options.files)) {
            if (name !== 'error') {
                const logger = new Logger(Object.assign({
                    file
                }, options));
                this.loggers.set(name, logger);

                // eslint-disable-next-line
                await logger.ready();
            }
        }
    }

    stop() {
        for (let logger of this.loggers.values()) {
            logger.stop();
        }
    }
};

module.exports.Metric = Metric;
module.exports.Logger = Logger;