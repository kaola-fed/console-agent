const { Loader, kagent, launch } = require('./lib');
const loader = new Loader();
const localConfig = loader.load();
const logger = console;

module.exports = kagent;
module.exports.ready = require('./lib/utils/ready');

if (localConfig) {
  launch(localConfig)
    .catch((e) => {
      logger.error(e);
    });
} else {
  module.exports.launch = (config) => launch(config);
}