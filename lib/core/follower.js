const pify = require('pify');
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

  sendToLeader(source) {
    const body = Buffer.from(source);
    const data = Buffer.alloc(8 + body.length);

    data.writeInt32BE(1, 0);
    data.writeInt32BE(body.length, 4);
    body.copy(data, 8, 0);

    return pify(this.client.send.bind(this.client))({
      id: 1,
      data,
      timeout: 5000
    })
  }
}