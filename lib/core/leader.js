const Base = require('sdk-base');
const assert = require('assert');
const Server = require('./server');
const WebsocketAgent = require('./websocket-agent');


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

  get agentConfig() {
    return this.options.agentConfig;
  }

  async _init() {
    this.server = new Server({
      port: this.port,
      logger: this.logger
    });
    await this.server.ready();

    this.server.on('follow', async ({request, data}) => {
      this.logger.info(`Leader recieved Follower(${data.from})'s connection.`);
      await request.send({ action: 'connected' });

      if (this.agent.config) {
        await this.syncStateTo(request, this.agent.config, data.from);
      }
    });

    this.server.on('message', ({
      // request,
      body
    }) => {
      this.logger.info(body);
    });

    const Agents = { websocket: WebsocketAgent, };
    const Agent = Agents[this.agentConfig.mode || 'websocket'];

    assert(Agent, 'unknown agentmode - ' + this.agentConfig.mode);

    this.agent = new Agent(this.agentConfig);
    await this.agent.ready();

    await this.syncState(this.agent.config);
    this.agent.on('sync:config', async() => {
      await this.syncState(this.agent.config);
    });
  }

  syncState(config) {
    const data = {
      action: 'syncState',
      data: config
    };
    this.logger.info('Leader synced state to all Followers.');
    return this.server.broadcast(data);
  }

  syncStateTo(request, config, pid) {
    const data = {
      action: 'syncState',
      data: config
    };
    this.logger.info(`Leader synced state to Follower(${pid}).`);
    return request.send(data);
  }

  destory() {
    return this.server.stop();
  }
}