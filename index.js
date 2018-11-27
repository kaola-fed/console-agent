const { Loader, Supervisor, Competition, Follower, Prepare } = require('./lib');
const loader = new Loader();
const config = loader.load();
const logger = console;

async function launch() {
  const prepare = new Prepare({
    logger
  });
  await prepare.ready();

  const { port } = prepare;

  logger.info(`[${process.pid}] Try to fight for Supervisor role.`);

  const supervisor = new Supervisor({
    port
  });
  await supervisor.ready();

  if (supervisor.success) {
    logger.info(`Current process(${process.pid}) forked Supervisor`);
  }

  logger.info(`[${process.pid}] Try to establish a connection with the Leader(port: ${port})`);

  const follower = new Follower({
    port,
    logger
  });
  await follower.ready();
}

if (config) {
  launch(config)
    .catch((e) => {
      logger.error(e);
    })
}

module.exports = () => {

}