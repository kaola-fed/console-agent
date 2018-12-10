const logger = console;

const Client = require('./core/client');
const Supervisor = require('./core/supervisor');
const Prepare = require('./core/prepare');
const Loader = require('./core/loader');
const Server = require('./core/server');
const Leader = require('./core/leader');
const kagent = require('./core/kagent');

const launch = async function(config) {
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

  const client = new Client({
    port,
    logger
  });
  await client.ready();


  kagent.install({
    client
  });
}


module.exports = {
  launch,
  Loader, Server, Leader, kagent
}