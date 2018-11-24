const { Loader, Supervisor, Competition, Follower, Prepare } = require('./lib');

const loader = new Loader();
const config = loader.load();

const getPort = require('./lib/utils/port');


async function launch() {
  const prepare = new Prepare();
  await prepare.ready();

  const portfile = getPort(prepare.portsdir);

  const competition = new Competition({
    port: portfile
  });
  await competition.ready();

  const { port } = competition;
  if (competition.success) {
    console.log(`Current process(${process.pid}) whill fork a Supervisor process`);

    const supervisor = new Supervisor({
      port
    });
    await supervisor.ready();
    console.log('Supervisor is forked');
  }

  const follower = new Follower({
    port
  });
  await follower.ready();
}

if (config) {
  launch(config)
    .catch((e) => {
      console.error(e);
    })
}

module.exports = () => {

}