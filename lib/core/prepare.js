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

  get portsdir() {
    return path.join(this.rootdir, 'ports');
  }

  get pidsdir() {
    return path.join(this.rootdir, 'pids');
  }

  async _init() {
    await mkdirp(this.rootdir);
    await mkdirp(this.portsdir);
    await mkdirp(this.logdir);
    await mkdirp(this.pidsdir);
  }
}
module.exports = Initialization;