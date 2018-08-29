const Base = require('sdk-base');
const assert = require('assert');
const path = require('path');
const {createWriteStream} = require('fs');
const fs = require('../../utils/fs');
const { MetrixTypes, CounterMetrixMethods, 
    // HistogramMetrixMethods, MeterMethods, 
    TimerMethods, GuageMethods } = require('./types');

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

class Metrix extends Base {
    constructor(options) {

        super(options);

        assert(options.scope, 'new Collection({scope, tag}), scope 是必须的');

        this.scope = options.scope;
        this.tag = options.tag;
        this.logger = options.logger;
    }

    counter(category) {
        const metrixType = MetrixTypes.counter;

        return {
            [CounterMetrixMethods.inc]: (value = 1) => {
                this.doMetrix(category, metrixType, CounterMetrixMethods.inc, value);
            },
            [CounterMetrixMethods.dec]: (value = 1) => {
                this.doMetrix(category, metrixType, CounterMetrixMethods.dec, value);
            }
        };
    }

    doMetrix(...args) {
        this.logger.log(JSON.stringify([this.scope, ...args]));
    }

    // getHistogram(category) {

    //     const metrixType = MetrixTypes.histogram;

    //     return {
    //         [HistogramMetrixMethods.update]: (value) => {
    //             this.doMetrix(category, metrixType, HistogramMetrixMethods.update, value);
    //         }
    //     };
    // }

    // getMeter(category) {
    //     const metrixType = MetrixTypes.meter;
    //     return {
    //         [MeterMethods.mark]: (value) => {
    //             this.doMetrix(category, metrixType, MeterMethods.mark, value);
    //         }
    //     };
    // }

    timer() {
        const metrixType = MetrixTypes.timer;

        return {
            [TimerMethods.start]: () => {
                const startTime = Date.now();
                return {
                    [TimerMethods.end]: (category) => {
                        this.doMetrix(category, metrixType, TimerMethods.update, Date.now() - startTime);
                    }
                };
            }
        };
    }

    guage(category) {
        const metrixType = MetrixTypes.guage;
        
        return {
            [GuageMethods.setValue]: (value) => {
                this.doMetrix(category, metrixType, GuageMethods.setValue, value);
            }
        };
    }
}

module.exports = class MetrixLogger extends Base {
    constructor(options) {
        super(Object.assign({
            initMethod: '_init'
        }, options));

        options.logger = options.logger || console;

        this._map = new Map();
    }

    getMetrix(scope, tag = 'built-in') {
        const key = scope + '_' + tag;

        if (!this._map.has(key)) {
            this._map.set(key, new Metrix({
                scope, tag,
                logger: this.loggers.get(tag)
            }));
        }

        return this._map.get(key);
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


module.exports.Metrix = Metrix;
module.exports.Logger = Logger;