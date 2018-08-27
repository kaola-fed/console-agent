'use strict';

const Parser = require('./base-parser');
const Metrix = require('../metrix');

class MetrixParser extends Parser {
    constructor(options) {
        super(options);
        this.reset();
    }

    reset() {
        this.metrix = new Metrix(this.options);
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