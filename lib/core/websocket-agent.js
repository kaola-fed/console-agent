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
    this.socket = require('socket.io-client')(this.server);

    await new Promise((resolve) => {
      this.socket.once('connect', resolve);
      this.socket.once('disconnect');
    });

    const state = await new Promise((resolve) => {
      this.socket.emit('init', {
        appid: this.appid,
        secret: this.secret,
      }, resolve);
    })
    
    this.config = state;
  }

  async report(
    data
  ) {
    this.logger.info(data);
    this.socket.emit('logs', data)
  }
}

module.exports = WebsocketAgent;