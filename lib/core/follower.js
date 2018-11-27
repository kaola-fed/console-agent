const pify = require('pify');
const assert = require('assert');
const Base = require('sdk-base');
const Client = require('./client');
const pid = process.pid;

module.exports = class Follower extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));

    this.client = new Client({
      port: this.port,
      host: '127.0.0.1'
    });
  }

  get port() {
    return this.options.port;
  }

  get logger() {
    return this.options.logger;
  }

  async _init() {
    await this.client.ready();
    await this.connectWithRetry();

    this.client.on('response', (response) => {
      const data = JSON.parse(response.data.toString());
      const actions = ['connected'];
      let action;

      if (actions.includes(data.action)) {
        action = data.action;
      } else {
        action = 'message';
      }

      this.emit(action, data);
    });

    this.client.on('request', (response) => {
      const data = JSON.parse(response.data.toString());
      const actions = ['excution', 'syncState'];
      let action;

      if (actions.includes(data.action)) {
        action = data.action;
      } else {
        action = 'message';
      }

      this.emit(action, data);
    })
  }

  async connectWithRetry() {
    let connecting = false;
    let interval = setInterval(async () => {
      if (connecting) {
        return;
      }
    
      connecting = true;
    
      try {
        const responseBody = await this.connect();
        const { action } = responseBody;

        if (action === 'connected') {
          this.logger.info(`Follower(${pid}) connected to the Leader.`);
          return clearInterval(interval);
        }
        this.logger.info(`Follower(${pid}) connected to the Leader failed, recieved: ${JSON.stringify(responseBody)}`)
      } catch(e) {
        this.logger.error(e);
      }

      connecting = false;
    }, 1000);
  }

  connect() {
    return this.sendToLeader('follow');
  }

  async sendToLeader(action, data) {
    assert(action, 'sendToLeader(action, data); action is required');

    const newData = {}

    newData.action = action;
    newData.data = data;
    newData.from = pid;

    const body = Buffer.from(JSON.stringify(newData));
    const sendData = Buffer.alloc(8 + body.length);

    sendData.writeInt32BE(1, 0);
    sendData.writeInt32BE(body.length, 4);
    body.copy(sendData, 8, 0);

    const res = await pify(this.client.send.bind(this.client))({
      id: 1,
      data: sendData,
      timeout: 5000
    })

    const responseBody = JSON.parse(res.toString());

    return responseBody;
  }
}