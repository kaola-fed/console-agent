const Base = require('sdk-base');
const mkdirp = require('mkdirp');
const path = require('path');
const os = require('os');

class Initialization extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));
  }

  get logdir() {
    return path.join(process.cwd(), 'logs');
  }

  get rootdir() {
    return path.join(os.homedir(), '.kagent');
  }

  get sockdir() {
    return path.join(this.rootdir, 'socks');
  }

  async _init() {
    await mkdirp(this.rootdir);
    await mkdirp(this.sockdir);
    await mkdirp(this.logdir);
    // await fs.writeFile(sock(this.sockdir));
  }
}
module.exports = Initialization;