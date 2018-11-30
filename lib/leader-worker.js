const { Leader } = require('./');
const gracefulExit = require('graceful-process');

const argv = JSON.parse(process.argv[2]);
const logger = console;

const leader = new Leader({
  port: argv.port,
  logger,
  agentConfig: argv.agentConfig
});

leader.ready()
  .then(() => {
    if (leader.server.listened) {
      process.send('LEADER_CREATED');
    } else {
      process.send('LEADER_HAS_CREATED');
    }
  })
  .catch(e => {
    logger.error(e);
    leader.destory();
    process.send('LEADER_CREATE_FAILED');
    process.exit(-1);
  })

gracefulExit({
  logger,
  label: 'Leader',
  beforeExit: () => {
    leader.destory();
  },
});

// throw new Error('')