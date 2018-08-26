const Base = require('sdk-base');
const assert = require('assert');
const fs = require('fs');
const { MetrixTypes, CounterMetrixMethods, 
    // HistogramMetrixMethods, MeterMethods, 
    TimerMethods, GuageMethods } = require('./types');

class Logger extends Base {
    constructor(options) {
        super(options);
        this._stream = fs.createWriteStream(options.file, { flags: 'a' });
    }

    log(args) {
        this._stream.write(args);
        this._stream.write('\n');
    }
}

class Metrix extends Base {
    constructor(options) {

        super(options);

        assert(options.scope, 'new Collection({scope, tag}), scope 是必须的');

        this.scope = options.scope;
        this.tag = options.tag;
        this.logger = options.logger;

        this.guageSetterList = [];
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
            },
            [GuageMethods.setGetter]: (getter) => {
                this.guageSetterList.push([
                    category, metrixType, GuageMethods.setValue, getter
                ]);
            }
        };
    }
}

module.exports = class MetrixLogger extends Base {
    constructor(options) {
        super(Object.assign({
            initMethod: '_init'
        }, options));
        this._map = new Map();

        this.loggers = new Map();
        for (let [name, file] of Object.entries(options.files)) {
            if (name !== 'error') {
                this.loggers.set(name, new Logger({
                    file
                }));
            }
        }
    }

    getMetrix(scope, tag = 'built-in') {
        const key = scope + '_' + tag;

        if (!this._map.has(key)) {
            this._map.set(key, new Metrix({
                scope, tag,
                logger: this.loggers.get(tag),
                metrix: this
            }));
        }

        return this._map.get(key);
    }

    // eslint-disable-next-line no-empty-function
    async _init() {

    }
};

