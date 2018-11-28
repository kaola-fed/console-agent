const pify = require('pify');
const assert = require('assert');
const Base = require('sdk-base');
const TCPClient = require('./tcp-client');
const pid = process.pid;

module.exports = class Client extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));

    this.client = new TCPClient({
      port: this.port,
      host: '127.0.0.1'
    });
    this._send = pify(this.client.send.bind(this.client));

    this.state = {};
    this.connected = false;
  }

  get isMaster() {
    return this.options.isMaster;
  }

  get port() {
    return this.options.port;
  }

  get logger() {
    return this.options.logger;
  }

  async _init() {
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

    this.client.on('close', async() => {
      this.connected = false;

      try {
        const retry = await this.connectWithRetry();
        this.emit('reconnected');
        this.logger.info(`connect successfully with retry(${retry})`);
      } catch(e) {
        this.logger.error(e);
      }
    });

    await this.client.ready();
    const retry = await this.connectWithRetry();

    this.logger.info(`connect successfully with retry(${retry})`);

    this.state = await new Promise((resolve) => {
      this.once('syncState', ({data}) => {
        resolve(data)
      });
    });
  }

  async connectWithRetry() {
    let trying = false;
    let retry = 0;
    let interval;

    await new Promise((done) => {
      interval = setInterval(async () => {
        if (trying) {
          return;
        }
      
        trying = true;
  
        try {
          await new Promise((resolve, reject) => {
            this.client._connect((e) => {
              if (e) {
                reject(e);
              } else {
                resolve();
              }
            })
          });
  
          const responseBody = await this.connect();
  
          const { action } = responseBody;
  
          if (action === 'connected') {
            return done();
          }
          this.logger.info(`Client(${pid}) connected to the Leader failed, recieved: ${JSON.stringify(responseBody)}`)
        } catch(e) {
          this.logger.error(e);
        }
  
        trying = false;
        retry += 1;
      }, 1000);
    })

    clearInterval(interval);

    this.connected = true;
    this.logger.info(`Client(${pid}) connected to the Leader.`);

    return retry;
  }

  connect() {
    return this._sendToLeader('follow');
  }

  async _sendToLeader(action, data) {
    const newData = {}

    newData.action = action;
    newData.data = data;
    newData.from = pid;

    const body = Buffer.from(JSON.stringify(newData));
    const sendData = Buffer.alloc(8 + body.length);

    sendData.writeInt32BE(1, 0);
    sendData.writeInt32BE(body.length, 4);
    body.copy(sendData, 8, 0);

    const res = await this._send({
      id: 1,
      data: sendData,
      timeout: 5000
    })

    const responseBody = JSON.parse(res.toString());

    return responseBody;
  }

  async sendToLeader(action, data) {
    assert(action, 'sendToLeader(action, data); action is required');

    if (this.connected === false) {
      await this.await('reconnected');
    }

    return this._sendToLeader(action, data);
  }
}