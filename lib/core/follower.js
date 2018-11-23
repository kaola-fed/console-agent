const Base = require('sdk-base');
const Client = require('./client');

module.exports = class Follower extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));

    this.client = new Client({
      path: this.sock
    });
  }

  get sock() {
    return this.options.sock;
  }

  async _init() {
    
  }
}