const Base = require('sdk-base');
const Measured = require('./measured');

module.exports = class Metrix extends Base {
    constructor(options = {}) {
        super(Object.assign(options, {
            initMethod: '_init'
        }));
        this.collection = {};
        this.timers = new Map();
        this.timerId = -1;
    }

    get duration() {
        return this.options.duration;
    }
    
    // eslint-disable-next-line no-empty-function
    async _init() {}

    json() {
        return this.collection;
    }

    create(categories) {
        if (typeof categories === 'undefined') {
            throw new Error('categories is void 0');
        }

        if (!Array.isArray(categories)) {
            categories = [categories];
        }

        let collection = this.collection;

        for (let category of categories) {
            if (!collection[category]) {
                collection[category] = {};
            }
            collection = collection[category];
        }
        
        return collection;
    }


    doMetrix(categories, key, metrixType, operation, value) {
        const collection = this.create(categories);

        if (!collection[key]) {
            const MetrixClass = Measured[metrixType];
            if (MetrixClass) {
                collection[key] = new MetrixClass({
                    duration: this.duration
                });
            }
        }

        if (collection[key] && collection[key][operation]) {
            collection[key][operation](value);
        }
    }
};
