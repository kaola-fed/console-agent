'use strict';

const Parser = require('./base-parser');
const Metrix = require('../metrix');

class MetrixParser extends Parser {
    constructor(options) {
        super(options);
        this.metrix = new Metrix(options);
    }

    get result() {
        return this.metrix.toJSON();
    }

    parse(line) {
        const object = JSON.parse(line);
        this.metrix.doMetrix(...object);
    }
}

module.exports = MetrixParser;