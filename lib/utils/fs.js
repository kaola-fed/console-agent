const fs = require('fs');
const pify = require('pify');
const exists = (file) => new Promise((resolve) => {
  fs.exists(file, (stat) => {
    resolve(stat);
  })
});
const readyFile = pify(fs.readFile.bind(fs));
const lstat = pify(fs.lstat.bind(fs));
const mkdir = pify(fs.mkdir.bind(fs));
const writeFile = pify(fs.writeFile.bind(fs));

module.exports = {
  readyFile, lstat, mkdir, writeFile, exists
}