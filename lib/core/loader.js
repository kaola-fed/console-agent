const Base = require('sdk-base');
const fs = require('fs');
const path = require('path');

module.exports = class Loader extends Base {
  load() {
    const configPath = path.join(process.cwd(), '.kagentrc.js')
    const hasConfig = fs.existsSync(configPath);

    if (hasConfig) {
      const stat = fs.lstatSync(configPath);
      if (stat.isFile()) {
        return require(configPath);
      }
    }
  }
}