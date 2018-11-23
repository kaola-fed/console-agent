const Base = require('sdk-base');
const cp = require('child_process');
const fs = require('mz/fs');
const Server = require('./server');


module.exports = class Leader extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));
  }

  get sock() {
    return this.options.sock;
  }

  async _init() {
    if (await fs.exists(this.sock)) {
      await fs.unlink(this.sock);
    }

    this.server = new Server({
      sock: this.sock,
    });

    await this.server.ready();
  }
}