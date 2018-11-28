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
    this.leaderActions = ['logs'];
    
    this.on('logs', ({ data }) => {
      if (data.length !== 0) {
        this.agent.report(data);
      }
    });
    
    await this.serverReady();
    await this.agentReady();
  }

  async agentReady() {
    const Agents = { websocket: WebsocketAgent, };
    const Agent = Agents[this.agentConfig.mode || 'websocket'];

    assert(Agent, 'unknown agentmode - ' + this.agentConfig.mode);

    this.agent = new Agent(Object.assign({}, this.agentConfig, {
      logger: this.logger
    }));
    await this.agent.ready();

    await this.syncState(this.agent.config);
    this.agent.on('sync:config', async() => {
      await this.syncState(this.agent.config);
    });
  }

  async serverReady() {
    this.server = new Server({
      port: this.port,
      logger: this.logger
    });
    await this.server.ready();

    this.server.on('follow', async ({request, data}) => {
      this.logger.info(`Leader recieved Client(${data.from})'s connection.`);
      await request.send({ action: 'connected' });

      if (this.agent.config) {
        await this.syncStateTo(request, this.agent.config, data.from);
      }
    });

    const { leaderActions } = this;
    this.server.on('message', ({
      request,
      data
    }) => {
      const { action } = data;
      request.send('ok');

      this.emit(leaderActions.includes(action) ? action: 'message', data);
      // this.logger.info(data);
    });
  }

  syncState(config) {
    const data = {
      action: 'syncState',
      data: config
    };
    this.logger.info('Leader synced state to all Clients.');
    return this.server.broadcast(data);
  }

  syncStateTo(request, config, pid) {
    const data = {
      action: 'syncState',
      data: config
    };
    this.logger.info(`Leader synced state to Client(${pid}).`);
    return request.send(data);
  }

  destory() {
    return this.server.stop();
  }
}