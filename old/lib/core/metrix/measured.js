const Measured = require('measured-core');
const Timer = require('./timer');
const Meter = require('./meter');

module.exports = Object.assign({}, Measured, {
    Timer,
    Meter
});