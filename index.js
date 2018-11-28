const { Loader, Supervisor, Follower, Prepare, kagent } = require('./lib');
const loader = new Loader();
const localConfig = loader.load();
const logger = console;

async function launch(target, config) {
  const prepare = new Prepare({
    logger
  });
  await prepare.ready();

  const { port } = prepare;

  logger.info(`[${process.pid}] Try to fight for Supervisor role.`);

  const supervisor = new Supervisor({
    port, agentConfig: config
  });
  await supervisor.ready();

  if (supervisor.success) {
    logger.info(`Current process(${process.pid}) forked Supervisor`);
  }

  logger.info(`[${process.pid}] Try to establish a connection with the Leader(port: ${port})`);

  const follower = new Follower({
    port,
    logger,
  });
  await follower.ready();

  target.init(follower);
}

module.exports = kagent;

if (localConfig) {
  launch(kagent, localConfig)
    .catch((e) => {
      logger.error(e);
    });
} else {
  module.exports.launch = (config) => launch(kagent, config);
}
