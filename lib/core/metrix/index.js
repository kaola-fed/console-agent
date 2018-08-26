const Base = require('sdk-base');
const Measured = require('./measured');
const is = require('is');

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

    toJSON(collection = this.collection) {
        const json = {};

        for (let [name, value] of Object.entries(collection)) {
            if (value.toJSON) {
                json[name] = value.toJSON()
            } else if (is.object(value)) {
                json[name] = this.toJSON(value);
            } else {
                json[name] = value;
            }
        }

        return json;
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
