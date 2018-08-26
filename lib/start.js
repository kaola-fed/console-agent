const childprocess = require('child_process');
const path = require('path');
const agentWorker = path.join(__dirname, './worker');

module.exports = function(options, callback) {
    const worker = childprocess.fork(agentWorker, [
        JSON.stringify(options)
    ], {});
    const pid = worker.pid;

    worker.on('message', (message) => {
        const { action } = message;
        if (action === 'started') {
            callback(null, worker);
        }
    });

    worker.on('exit', (code, signal) => {
        if (Number(code) !== 0) {
            const err = new Error();
            err.name = 'MetrixRunnerError';
            err.message = 'code - ' + code + ', signal - ' + signal;
            err.pid = pid;
        }

        worker.removeAllListeners();
    });
};