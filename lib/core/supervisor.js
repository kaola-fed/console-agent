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

  get port() {
    return this.options.port;
  }

  async _init() {
    const worker = cp.spawn(process.argv[0], [supervisorWorker, JSON.stringify({
      port: this.port,
      pwd: process.cwd()
    })], {
      // detached: true,
      // stdio: 'inherit'
    });

    process.on('exit', () => {
      worker.kill('SIGINT');
    });

    await new Promise((resolve, reject) => {
      worker.stdout.on('data', (data) => {
        if (data.toString() === 'LEADER_CREATED') {
          resolve();
        }
        process.stdout.write('[Supervisor] ' + (data.toString().endsWith('\n')? data.toString() : (data.toString() + '\n')));
      });

      worker.stderr.once('data', (data) => {
        reject(new Error(data.toString()));
      });
    });

    worker.unref();

    this.pid = worker.pid;
  }
}