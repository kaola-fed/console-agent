const Base = require('sdk-base');
const cp = require('child_process');
const path = require('path');
const detect = require('detect-port');
const fs = require('fs');
const pfs = require('mz/fs');

const detectWorker = path.join(__dirname, '../detect-worker');

class Competition extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));
  }

  get portfile() {
    return this.options.port;
  }

  async _init() {
    let fd;
    let exist = false;
    let port;

    try {
      fd = fs.openSync(this.portfile, 'ax')
    } catch(e) {
      if (e.code === 'EEXIST') {
        exist = true;
      } else {
        console.error(e);
        return;
      }
    }

    if (!exist) {
      port = await detect(58000);

      await pfs.write(fd, port.toString());

      try {
        fs.closeSync(fd);
      } catch(e) {
        console.warn('关闭 sock 文件失败', e);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    port = fs.readFileSync(this.portfile, 'utf-8');

    const p = cp.fork(detectWorker, [port]);

    this.success = await new Promise((resolve, reject) => {
      p.once('message', (message) => {
        (message === 'success') ? resolve(true): resolve(false)
      })
    })

    this.port = port;
  }
}

module.exports = Competition;