const jsonToArray = require('../../utils/json-to-array');
const flat = require('../../utils/flat');

const Reporter = require('./reporter');
const fs = require('../../utils/fs');
const { KAGENT_RESULTS_PREFIX } = require('../consts');
const path = require('path');

module.exports = class FileSystemReporter extends Reporter {
    get rootdir() {
        return this.options.rootdir;
    }

    getDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const hours = date.getHours();
        const minutes = date.getMinutes();

        return {
            year, month, date: date.getDate(), hours, minutes
        }
    }

    async report(list) {
        const json = list.reduce((prev, item) => {
            return Object.assign(prev, jsonToArray(item, flat));
        }, {});

        const { year, month, date, hours, minutes } = this.getDate();

        const filename = `${KAGENT_RESULTS_PREFIX}${year}-${month}-${date}_${hours}_${minutes}.json`;

        await fs.rwrite(path.join(this.rootdir, filename), JSON.stringify(json));

        return {
            code: 200,
            data: json
        };
    }
};