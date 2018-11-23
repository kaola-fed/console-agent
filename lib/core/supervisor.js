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
      sock: this.sock,
    })], {
      // detached: true,
      // stdio: 'inherit'
    });

    process.on('exit', () => {
      worker.kill('SIGINT');
    });

    const result = await new Promise((resolve, reject) => {
      worker.stdout.on('data', (data) => {
        if (data.toString() === 'LEADER_CREATED') {
          resolve();
        }
        console.log('[Supervisor]', data.toString());
      });

      worker.stderr.once('data', (data) => {
        reject(new Error(data.toString()));
      });
    });

    worker.unref();

    return result;
  }
}