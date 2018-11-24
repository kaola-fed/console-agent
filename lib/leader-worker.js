const {Leader} = require('./');
const gracefulExit = require('graceful-process');

const argv = JSON.parse(process.argv[2]);
const leader = new Leader({
  port: argv.port
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
    console.log('beforeExit');
    leader.destory();
  },
});

// throw new Error('')