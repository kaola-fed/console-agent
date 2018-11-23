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

  async _init() {
    this.server = net.createServer((conn) => {
      let header;
      let bodyLen;
      
      function readPacket() {
        if (bodyLen == null) {
          header = conn.read(8);
          if (!header) {
            return false;
          }
          bodyLen = header.readInt32BE(4);
        }
    
        if (bodyLen === 0) {
          conn.write(header);
        } else {
          const body = conn.read(bodyLen);
          if (!body) {
            return false;
          }
          conn.write(Buffer.concat([ header, body ]));
        }
        bodyLen = null;
        return true;
      }
    
      conn.on('readable', () => {
        try {
          let remaining = false;
          do {
            remaining = readPacket();
          }
          while (remaining);
        } catch (err) {
          console.error(err);
        }
      });
    });

    const success = await new Promise((resolve) => {
      this.server.on('error', (
        // e
      ) => {
        resolve(false);
      });
  
      this.server.listen(this.sock, () => {
        resolve(true);
      });
    });

    this.started = success;
  }

  stop() {
    return pify(this.server.close.bind(this.server))()
  }
}