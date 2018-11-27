const Base = require('sdk-base');
const mkdirp = require('mkdirp');
const path = require('path');
const os = require('os');
const fs = require('fs');
const getPortfile = require('../utils/port');
const detect = require('detect-port');
const pfs = require('mz/fs');


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

  get logger() {
    return this.options.logger;
  }

  async _init() {
    await mkdirp(this.rootdir);
    await mkdirp(this.portsdir);
    await mkdirp(this.logdir);
    await mkdirp(this.pidsdir);
    await this.getPort();
  }

  async getPort() {
    const portfile = getPortfile(this.portsdir);

    let fd;
    let hasCreated = false;

    try {
      fd = fs.openSync(portfile, 'ax')
    } catch(e) {
      if (e.code === 'EEXIST') {
        hasCreated = true;
      } else {
        this.logger.error(e);
        return;
      }
    }

    if (!hasCreated) {
      const port = await detect(58000);

      await pfs.write(fd, port.toString());

      try {
        fs.closeSync(fd);
      } catch(e) {
        this.logger.warn('关闭 sock 文件失败', e);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    const port = fs.readFileSync(portfile, 'utf-8');

    this.port = port;
  }
}
module.exports = Initialization;