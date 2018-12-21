const Koa = require('koa');
const netModule = require('net');
const netServer = netModule.Server;

let servers = [];
netModule.Server = function(...args) {
  const server = netServer(...args);

  server.on('connect', () => {

  });

  server.on('close', () => {
    servers.splice(servers.indexOf(server), 1);
  })
  servers.push(server);
  return server;
};


const app = new Koa();

app.use(async function (ctx) {
  // throw new Error('hello');
  ctx.body = 'body';
  await new Promise((resolve) => {
    servers.forEach((server) => {
      console.log(server._connections);
    })
    setTimeout(resolve, 3000);
  })
})

app.listen(9000);