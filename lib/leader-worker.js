const {Leader} = require('./');
const gracefulExit = require('graceful-process');

const argv = JSON.parse(process.argv[2]);
const leader = new Leader({
  sock: argv.sock
});

leader.ready()
  .then(() => {
    process.send('LEADER_CREATED');
  })
  .catch(e => {
    console.error(e);
  })

gracefulExit({
  logger: console,
  label: 'aa',
  beforeExit: () => {
    leader.destory();
  },
});

// throw new Error('')