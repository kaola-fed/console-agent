const Base = require('sdk-base');
const net = require('net');
const pify = require('pify');

module.exports = class Leader extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));
  }

  get sock() {
    return this.options.sock;
  }

  get onconnection() {
    return this.options.onconnection;
  }

  async _init() {
    this.server = net.createServer(this.onconnection);

    const success = await new Promise((resolve) => {
      this.server.on('error', (
        e
      ) => {
        if (e.code === 'EADDRINUSE') {
          return resolve(false);
        } 
        resolve(false);
        console.warn('maybe some error in compete leader:', e)
      });
  
      this.server.listen(this.sock, () => {
        resolve(true);
      });
    });

    this.listened = success;
  }

  stop() {
    return pify(this.server.close.bind(this.server))()
  }
}