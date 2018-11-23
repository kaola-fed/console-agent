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

  const body = new Buffer('hello');
  const data = new Buffer(8 + body.length);

  data.writeInt32BE(1, 0);
  data.writeInt32BE(body.length, 4);
  body.copy(data, 8, 0);


  follower.client.send({
    id: 1,
    data,
    timeout: 5000,
  }, (err, res) => {
    if (err) {
      console.log(err);
    }
    console.log(res.toString());
  });
  await follower.ready();
}

if (config) {
  init(config)
    .catch((e) => {
      console.error(e);
    })
}

module.exports = () => {

}