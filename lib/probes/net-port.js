const netModule = require('net');
const ready = require('../utils/ready');

const originaListen = netModule.Server.prototype.listen;
const portsList = [];

netModule.Server.prototype.listen = function(...args) {
  const port = parseInt(args[0], 10);

  if (!isNaN(port) && portsList.indexOf(port) === -1) {
    portsList.push(port);
  }

  this.once('close', function() {
    const portIndex = portsList.indexOf(port);
    if (portIndex > -1) {
      portsList.splice(portIndex, 1);
    }
  });
  return Reflect.apply(originaListen, this, args);
};

// 在 probes 目录内直接使用 kagent.xxx 即可
ready((kagent) => {
  kagent.guage('process/net/ports', () => {
    return portsList.join(',') || 'N/A';
  });
});