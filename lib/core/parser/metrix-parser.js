'use strict';

const Parser = require('./base-parser');
const Metrix = require('../metrix');

class MetrixParser extends Parser {
    constructor(options) {
        super(options);
        this.metrix = new Metrix(options);
    }

    get result() {
        return this.metrix.json();
    }

    parse(line) {
        const object = JSON.parse(line);
        const message = JSON.parse(object.message);

        this.metrix.doMetrix(...message);
    }
}

module.exports = MetrixParser;