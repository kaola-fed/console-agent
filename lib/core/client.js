const Base = require('tcp-base');

module.exports = class Client extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));
  }

  getHeader() {
    return this.read(8);
  }

  getBodyLength(header) {
    return header.readInt32BE(4);
  }

  decode(body, header) {
    return {
      id: header.readInt32BE(0),
      data: body,
    };
  }

  // heartbeat packet
  get heartBeatPacket() {
    return Buffer.from([255, 255, 255, 255, 0, 0, 0, 0])
  }

  async _init() {
    
  }
}