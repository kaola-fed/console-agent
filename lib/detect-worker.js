const {Server} = require('./');
const gracefulExit = require('graceful-process');

const argv = process.argv[2];

const server = new Server({
  port: Number(argv)
});

server.ready()
  .then(() => {
    if (server.listened) {
      setTimeout(() => {
        server.stop()
          .then(() => {
            process.send('success');

          })
          .catch((e) => {
            process.send('success');
          });
      }, 300);
    } else {
      setTimeout(() => {
        process.send('failed');
      }, 500);
    }
  })
  .catch(e => {
    console.error(e);
  })

gracefulExit({
  logger: console,
  label: 'detect-worker',
  beforeExit: () => {
    leader.destory();
  },
});