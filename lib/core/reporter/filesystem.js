const jsonToArray = require('../../utils/json-to-array');
const flat = require('../../utils/flat');

const Reporter = require('./reporter');
const fs = require('mz/fs');
const path = require('path');

module.exports = class extends Reporter {
    get rundir() {
        return this.options.rundir;
    }
    async report(list) {
        const json = list.reduce((prev, item) => {
            return Object.assign(prev, jsonToArray(item, flat));
        }, {});
        const date = new Date();

        const filename = `${date.getFullYear()}_${date.getMonth()}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}.json`;

        await fs.writeFile(path.join(this.rundir, filename), JSON.stringify(json));
    }
};