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
      stdio: [
        process.stdin, process.stdout, process.stderr, 'ipc'
      ]
    });
    
    process.on('exit', () => {
      worker.kill('SIGINT');
    });

    const success = await new Promise((resolve, reject) => {
      worker.on('message', ({action}) => {
        switch(action) {
        case 'LEADER_CREATED':
          return resolve(true);
        case 'LEADER_HAS_CREATED':
          return resolve(false);
        case 'LEADER_CREATE_FAILED':
          return reject(new Error('leader create failed, please check the logs.'));
        default:
        }
      });
    });

    worker.unref();

    this.pid = worker.pid;
    this.success = success;
  }
}