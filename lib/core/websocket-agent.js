const Base = require('sdk-base');

class WebsocketAgent extends Base {
  get server() {
    return this.options.server;
  }

  get appid() {
    return this.options.appid;
  }

  get secret() {
    return this.options.secret;
  }

  get logger() {
    return this.options.logger;
  }
  
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));
  }

  async _init() {
    this.config = {

    }
  }

  async report(
    data
  ) {
    this.logger.info(data);
  }
}

module.exports = WebsocketAgent;