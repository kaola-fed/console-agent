const cp = require('child_process');
const path = require('path');
const argv = process.argv[2];
const leaderWorkerFile = path.join(__dirname, './leader-worker.js');
const passed = ['LEADER_CREATED', 'LEADER_HAS_CREATED', 'LEADER_CREATE_FAILED'];
const [LEADER_CREATED] = passed;
const logger = console;

function fork() {
  let leaderWorker = cp.fork(leaderWorkerFile, [argv], {
    stdio: [process.stdin, process.stdout, process.stderr, 'ipc']
  });
  let isRefork = false;

  leaderWorker.once('exit', (code, signal) => {
    logger.info(`code - ${code}, signal - ${signal}`);
    leaderWorker.removeAllListeners();

    if (isRefork) {
      logger.info('Refork mode is enabled, will refork soon!');
      fork();
    } else {
      logger.info('Refork mode is disabled, please check the error above this line.');
    }
  });

  leaderWorker.on('message', (message) => {
    if (message === LEADER_CREATED) {
      isRefork = true;
      logger.info(`[${process.pid}] Refork mode is actived`);
    }

    if (
      passed.includes(message)
    ) {
      process.send({
        action: message
      })
    }
  });

  const onSignal = (code = 0) => {
    process.exit(code);
  }

  process.once('SIGINT', onSignal);
  process.once('SIGQUIT', onSignal);
  process.once('SIGTERM', onSignal);

  process.on('exit', () => {
    leaderWorker.kill('SIGHUP');
  });
}

fork();

