const Base = require('sdk-base');

module.exports = class Client extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));
    this.state = {};
  }

  get client() {
    return this.options.client;
  }

  async _init() {
    this.client.on('syncState', ({data}) => {
      this.state = data;
    })
  }
}