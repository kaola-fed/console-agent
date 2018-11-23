const cp = require('child_process');
const path = require('path');

const argv = process.argv[2];

const leaderWorkerFile = path.join(__dirname, './leader-worker.js');

function fork() {
  let leaderWorker = cp.fork(leaderWorkerFile, [argv], {
  });

  leaderWorker.once('exit', (code, signal) => {
    console.log(`code - ${code}, signal - ${signal}`);
    fork();
  });

  leaderWorker.on('message', (message) => {
    if (message === 'started') {
      process.stdout.write(message);
    }
  })
}

fork();

