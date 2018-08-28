const jsonToArray = require('../../utils/json-to-array');
const flat = require('../../utils/flat');

const Reporter = require('./reporter');
const fs = require('../../utils/fs');
const path = require('path');
const os = require('os');

module.exports = class FileSystemReporter extends Reporter {
    get name() {
        return this.options.name;
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

        const { year, month, day, hours, minutes } = this.getDate();

        const filename = `metrix-results-${year}-${month}-${day}_${hours}_${minutes}.json`;

        await fs.rwrite(path.join(os.homedir(), 'kagent', this.name, filename), JSON.stringify(json));

        return {
            code: 200,
            data: json
        };
    }
};