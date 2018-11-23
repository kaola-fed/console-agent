const Base = require('sdk-base');

module.exports = class Reporter extends Base {
    async _init() {
        
    }
    report() {
        throw new Error('Reporter.report is abstract');
    }
};