'use strict';

const pify = require('pify');
const del = require('del');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');


const pfs = pify(fs);

Object.assign(pfs, {
    rwrite(filepath, content) {
        const dir = path.dirname(filepath);
        return pify(mkdirp)(dir).then(() => {
            return pify(fs.writeFile)(filepath, content);
        });
    },
    readJSONFile(url) {
        return pfs.readFile(url).then(buffer => buffer.toString()).then(json => {
            return JSON.parse(json);
        });
    },
    del,
    mkdirp,
    exists(file) {
        return new Promise(function(resolve) {
            fs.exists(file, resolve);
        });
    }
});

module.exports = pfs;
