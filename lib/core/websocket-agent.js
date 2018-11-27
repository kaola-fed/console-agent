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
  
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));
  }

  async _init() {
    this.config = {

    }
  }
}

module.exports = WebsocketAgent;