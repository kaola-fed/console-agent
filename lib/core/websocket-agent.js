const os = require('os');
const Base = require('sdk-base');
const io = require('socket.io-client');


class Reporter extends Base {
  get socket() {
    return this.options.socket;
  }

  get logger() {
    return this.options.logger;
  }

  constructor(options) {
    super(options);
    this.buffer = [];
  }

  start(interval = 1000) {
    let uploading = true;

    setInterval(() => {
      if (uploading && this.buffer.length > 0) {
        this.socket.emit('logs', this.buffer);
        this.buffer.length = 0;
      }
    }, interval);

    this.socket.on('disconnect', () => {
      uploading = false;
      this.logger.info('Connection is loss, reporter will cache the logs during reconnecting.');
    });

    this.socket.on('connect', () => {
      uploading = true;
      this.logger.info('Connection is built, reporter will push the logs in next interval.');
    })
  }

  report(data) {
    this.buffer = this.buffer.concat(data);
  }
}

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
  }

  async _init() {
    this.socket = io(this.server);
    this.reporter = new Reporter({
      logger: this.logger,
      socket: this.socket,
    });

    this.socket.once('unAuth', () => {
      process.exit(0);
    });

    this.config = await this.init();
    this.reporter.start(this.config.reportInterval);
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.logger.info('Connecting to remote server.');
      this.socket.once('connect', () => {
        this.logger.info('Connected with remote server, and will fetch initial state.');

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

          this.logger.info('Fetched initial state.');

          resolve(res.data);
        });
      })
    })
  }

  async report(
    data
  ) {
    this.reporter.report(data);
  }
}

module.exports = WebsocketAgent;