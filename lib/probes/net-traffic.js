const netModule = require('net');
const ready = require('../utils/ready');
  
let download = 0;
let upload = 0;
let up = '0 B/sec';
let down = '0 B/sec';
let count = 0;

const filter = function(bytes) {
  let toFixed = 0;

  if (bytes !== 0) {
    if (bytes < 1024) {
      toFixed = 6;
    } else if (bytes < (1024 * 1024)) {
      toFixed = 3;
    } else {
      toFixed = 2;
    }
  }

  bytes = (bytes / (1024 * 1024)).toFixed(toFixed);

  let cutZeros = 0;

  for (let i = (bytes.length - 1); i > 0; i -= 1) {
    if (bytes[i] === '.') {
      cutZeros += 1;
      break;
    }
    if (bytes[i] !== '0') {
      break;
    }
    cutZeros += 1;
  }

  if (cutZeros > 0) {
    bytes = bytes.slice(0, -cutZeros);
  }

  return (bytes + ' MB/s');
}

// const servers = [];
// const netServer = netModule.Server;

// netModule.Server = function(...args) {
//   const server = netServer(...args);
//   servers.push(server);
//   return server;
// };

const originalWrite = netModule.Socket.prototype.write;

netModule.Socket.prototype.write = function(...args) {
  const [data] = args;
  if (data.length) {
    upload += data.length;
  }
  return Reflect.apply(originalWrite, this, args);
};

const originalPush = netModule.Socket.prototype.push;

netModule.Socket.prototype.push = function(...args) {
  const [data] = args;

  if (data && data.length) {
    download += data.length;
  }

  return Reflect.apply(originalPush, this, args);
};


ready(() => {
  require('../core/kagent').guage('process/net/traffic', () => {
    up = filter(upload);
    down = filter(download);
    upload = 0;
    download = 0;

    // servers.forEach((server) => {
    //   // server.getConnections((...args) => {
    //   //   console.log(args)
    //   // })
    //   console.log(server._connections);
    // })
    // const c = servers.reduce((prev, s) => prev + s.getConnections(), 0);
    // console.log(c);

    return {
      upload: up,
      download: down,
      connection: count
    };
  });
})