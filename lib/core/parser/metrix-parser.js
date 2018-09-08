'use strict';

const Parser = require('./abstract-parser');
const MetrixItem = require('../metrix/item');

class MetrixParser extends Parser {
    constructor(options) {
        super(options);
        this.reset();
    }

    reset() {
        this.metrix = new MetrixItem(this.options);
    }

    getResult() {
        const results = this.metrix.toJSON();
        this.reset();
        return results;
    }

    parse(line) {
        const object = JSON.parse(line);
        this.metrix.doMetrix(...object);
    }
}

module.exports = MetrixParser;