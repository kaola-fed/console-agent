const Base = require('sdk-base');
const fs = require('fs');
const path = require('path');

class ConfigParsedError extends Error {
  constructor(content) {
    super();
    this.name = 'ConfigParsedError';
    this.message = `parsed error: ${content}`
  }
}

module.exports = class Loader extends Base {
  load() {
    const configPath = path.join(process.cwd(), '.kagentrc')
    const hasConfig = fs.existsSync(configPath);

    if (hasConfig) {
      const stat = fs.lstatSync(configPath);
      if (stat.isFile()) {
        const content = fs.readFileSync(configPath, 'utf-8');
        let config;
        try {
          config = JSON.parse(content)
        } catch(e) {
          throw new ConfigParsedError(content)
        }

        return config;
      }
    }
  }
}