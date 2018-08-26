'use strict';

const pify = require('pify');
const del = require('del');
const mkdirp = require('mkdirp');
const path = require('path');
const mfs = require('mz/fs');

module.exports = Object.assign({}, mfs, {
    rwrite(filepath, content) {
        const dir = path.dirname(filepath);
        return pify(mkdirp)(dir).then(() => {
            return mfs.writeFile(filepath, content);
        });
    },
    readJSONFile(url) {
        return mfs.readFile(url).then(buffer => buffer.toString()).then(json => {
            return JSON.parse(json);
        });
    },
    del,
    mkdirp
});