const { Meter } = require('measured-core');

module.exports = class extends Meter {
    // second
    get duration() {
        return this._properties.duration;
    }

    toJSON() {
        return {
            rate: (this._count === 0)? 0 : (this._count / this.duration),
            count: this._count
        };
    }
};
