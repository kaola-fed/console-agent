const os = require('os');
const Base = require('sdk-base');
const io = require('socket.io-client');

class WebsocketAgent extends Base {
  get server() {
    return this.options.server;
  }

  get appid() {
    return this.options.appid;
  }

  get secret() {
    return this.options.secret;
  }

  get cluster() {
    return this.options.cluster;
  }

  get logger() {
    return this.options.logger;
  }
  
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));

    this.reportLogs = [];
  }

  async _init() {
    this.socket = io(this.server);

    this.socket.once('unAuth', () => {
      process.exit(0);
    });

    this.config = await this.init();

    const { reportInterval = 1000 } = this.config;

    setInterval(() => {
      this.socket.emit('logs', this.reportLogs);
      this.reportLogs.length = 0;
    }, reportInterval)
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.socket.once('connect', () => {
        this.socket.emit('init', {
          auth: {
            appid: this.appid,
            secret: this.secret,
            
          },
          server: {
            clusterName: this.cluster,
            hostname: os.hostname(),
          }
        }, (res) => {
  
          if (res.code !== 200) {
            return reject(new Error(res.message));
          }
  
          resolve(res.data);
        });
      })
    })
  }

  async report(
    data
  ) {
    this.reportLogs = this.reportLogs.concat(data);
  }
}

module.exports = WebsocketAgent;