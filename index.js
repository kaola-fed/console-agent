const { Loader, Supervisor, Competition, Follower, Prepare } = require('./lib');

const loader = new Loader();
const config = loader.load();

const getSock = require('./lib/utils/sock');


async function init() {
  const prepare = new Prepare();
  await prepare.ready();

  const sock = getSock(prepare.sockdir);

  const competition = new Competition({
    sock
  });
  await competition.ready();

  if (competition.success) {
    console.log('竞争成功，当前进程将 fork 出 Supervisor 进程');
    const supervisor = new Supervisor({
      sock
    });
    await supervisor.ready();
    console.log('已 fork 出 Supervisor');
  }

  const follower = new Follower({
    sock
  });

  await follower.ready();
  await follower.sendToLeader('hello')
}

if (config) {
  init(config)
    .catch((e) => {
      console.error(e);
    })
}

module.exports = () => {

}