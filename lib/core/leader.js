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

  async _init() {
    this.server = new Server({
      port: this.port,
      onconnection: (conn) => {
        let header;
        let bodyLen;
        
        const readPacket = () => {
          if (bodyLen === null) {
            header = conn.read(8);
            if (!header) {
              return false;
            }
            bodyLen = header.readInt32BE(4);
          }
      
          if (bodyLen === 0) {
            conn.write(header);
          } else {
            const reciveBody = conn.read(bodyLen);
            console.log(reciveBody.toString());

            const body = Buffer.from('{h1221ello: world}');
            const data = Buffer.alloc(8 + body.length);
          
            data.writeInt32BE(1, 0);
            data.writeInt32BE(body.length, 4);
            body.copy(data, 8, 0);

            conn.write(data);
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
      }
    });

    await this.server.ready();
  }

  destory() {
    return this.server.stop();
  }
}