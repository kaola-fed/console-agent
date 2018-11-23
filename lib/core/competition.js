const Base = require('sdk-base');
const Server = require('./server');
const fs = require('mz/fs');

class Competition extends Base {
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
      sock: this.sock
    });

    await this.server.ready();

    this.success = this.server.listened;

    if (this.success) {
      await this.server.stop();
    }
  }
}

module.exports = Competition;