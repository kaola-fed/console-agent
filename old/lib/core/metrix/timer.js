const { Timer } = require('measured-core');
const Meter = require('./meter');


module.exports = class {
   /**
    * @param {TimerProperties} [properties] See {@link TimerProperties}.
    */
    constructor(properties = {}) {
        const { duration } = properties;

        return new Timer(Object.assign({}, properties, {
            meter: new Meter({ duration })
        }));
    }

};