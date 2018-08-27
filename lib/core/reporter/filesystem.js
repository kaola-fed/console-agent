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
    async report(list) {
        const json = list.reduce((prev, item) => {
            return Object.assign(prev, jsonToArray(item, flat));
        }, {});
        const date = new Date();

        const filename = `metrix-results-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}_${date.getMinutes()}.json`;

        await fs.rwrite(path.join(os.homedir(), 'kagent', this.name, filename), JSON.stringify(json));

        return {
            code: 200,
            data: json
        };
    }
};