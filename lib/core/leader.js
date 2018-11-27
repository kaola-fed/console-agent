const Base = require('sdk-base');
const Server = require('./server');


module.exports = class Leader extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));
  }

  get port() {
    return this.options.port;
  }

  get logger() {
    return this.options.logger;
  }

  async _init() {
    this.server = new Server({
      port: this.port,
      logger: this.logger
    });
    await this.server.ready();

    this.server.on('follow', async ({request, data}) => {
      this.logger.info(`Leader recieved Follower(${data.from})'s connection.`);
      await request.send({data: 'ok'});
      this.server.broadcast();
    });

    this.server.on('message', ({
      // request,
      body
    }) => {
      this.logger.info(body);
    });
  }

  destory() {
    return this.server.stop();
  }
}