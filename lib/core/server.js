const Base = require('sdk-base');
const net = require('net');
const pify = require('pify');

class Request extends Base {
  get socket() {
    return this.options.socket;
  }

  async send(data = '') {
    const buf1 = Buffer.from(JSON.stringify(data));
    const buf2 = Buffer.alloc(8 + buf1.length);
  
    buf2.writeInt32BE(1, 0);
    buf2.writeInt32BE(buf1.length, 4);
    buf1.copy(buf2, 8, 0);

    this.socket.write(buf2);
  }
}

class RequestPool extends Base {
  constructor() {
    super();
    this.socketPool = [];
    this.requestPool = [];
  }

  filter(fn) {
    return this.requestPool.filter(fn);
  }

  forEach(fn) {
    return this.filter(item => item).forEach(fn);
  }

  map(fn) {
    return this.filter(item => item).map(fn);
  }

  free(socket) {
    const index = this.socketPool.indexOf(socket);

    if (index > -1) {
      this.socketPool[index] = null;
      this.requestPool[index] = null;
    }
  }

  alloc(socket) {
    const index = this.socketPool.indexOf(socket);
    if (index > -1) {
      return this.socketPool[index];
    }

    let id = 0;

    for (let requestId of this.socketPool) {
      id += 1;
      if (!requestId) {
        break;
      }
    }

    const request = new Request({
      socket
    });
    
    this.socketPool[id] = socket;
    this.requestPool[id] = request;

    return {
      id, request
    };
  }
}

module.exports = class Leader extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));
    this.requestPool = new RequestPool();
  }

  get port() {
    return this.options.port;
  }

  get logger() {
    return this.options.logger;
  }

  async broadcast(data) {
    const promises = this.requestPool.map((request) => request.send(data));
    await Promise.all(promises);
  }

  async _init() {
    this.server = net.createServer((socket) => {
      const { request, id } = this.requestPool.alloc(socket);

      let header;
      let bodySize = null;
      
      const readPacket = () => {
        if (bodySize === null) {
          header = socket.read(8);
          if (!header) {
            return false;
          }
          bodySize = header.readInt32BE(4);
        }
    
        if (bodySize !== 0) {
          const buf = socket.read(bodySize);
          const str = buf.toString();
          const data = JSON.parse(str);
          const { action } = data;
          const serverActions = ['follow'];
          const actionName = serverActions.includes(action)? action: 'message';

          this.emit(actionName, {
            request, data, id
          });
        }
        bodySize = null;
        return true;
      }
    
      socket.on('readable', () => {
        try {
          let remaining = false;
          do {
            remaining = readPacket();
          }
          while (remaining);
        } catch (err) {
          this.logger.error(err);
        }
      });

      socket.on('close', () => {
        this.requestPool.free(socket);
      });
    });

    const success = await new Promise((resolve, reject) => {
      this.server.once('error', (
        e
      ) => {
        if (e.code === 'EADDRINUSE') {
          return resolve(false);
        } 
        reject(e);
      });

      this.server.listen(this.port, () => {
        this.logger.info('listened ' + this.port);
        resolve(true);
      });
    });

    this.listened = success;
  }

  stop() {
    return pify(this.server.close.bind(this.server))()
  }
}