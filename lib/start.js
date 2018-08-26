const childprocess = require('child_process');
const path = require('path');
const agentWorker = path.join(__dirname, './worker');
const uuid = require('uuid');
const pify = require('pify');

class AgentKWorker {
    constructor(worker) {
        this.worker = worker;
    }

    report(name) {
        const id = uuid()
        this.worker.send({
            action: 'report',
            data: {
                id,
                name
            }
        });

        return pify((callback) => {
            const on = (msg) => {
                msg.action = msg.action || msg;
                if (msg.action === 'response-report-' + id) {
                    callback(null, msg.data);
                    this.worker.removeListener('message', on);
                }
            }
            this.worker.on('message', on);
        })();
    }

    collect() {
        const id = uuid()
        this.worker.send({
            action: 'collect',
            data: {
                id
            }
        });

        return pify((callback) => {
            const on = (msg) => {
                msg.action = msg.action || msg;
                if (msg.action === 'response-collect-' + id) {
                    callback(null, msg.data);
                    this.worker.removeListener('message', on);
                }
            }
            this.worker.on('message', on);
        })();
    }

    kill() {
        this.worker.kill();
    }
}

module.exports = function(options, callback) {
    const worker = childprocess.fork(agentWorker, [
        JSON.stringify(options)
    ], {});
    const pid = worker.pid;

    worker.on('message', (message) => {
        const { action } = message;
        if (action === 'started') {
            callback(null, new AgentKWorker(worker));
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