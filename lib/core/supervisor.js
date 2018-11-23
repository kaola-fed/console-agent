const Base = require('sdk-base');
const cp = require('child_process');
const path = require('path');

const supervisorWorker = path.join(__dirname, '../supervisor-worker.js');

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
    const worker = cp.spawn(process.argv[0], [supervisorWorker, JSON.stringify({
      sock: this.sock
    })], {
      // detached: true,
      // stdio: 'inherit'
    });

    return new Promise((resolve, reject) => {
      worker.stdout.on('data', (data) => {
        if (data.toString() === 'started') {
          resolve();
        }
        console.log('来自 Leader:', data.toString());
      });

      worker.stderr.once('data', (data) => {
        reject(new Error(data.toString()));
      });
    })
  }
}