const childprocess = require('child_process');
const path = require('path');
const agentWorker = path.join(__dirname, './worker');
const uuid = require('uuid');
const pify = require('pify');
const {isWindows} = require('is-os');

class KAgentWorker {
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
    /**
     * 1. 服务器不可能为 win 环境
     * 2. egg 启动时会带上 development 的环境变量，不需要此环境变量
     */
    if (!isWindows() || (process.env.NODE_ENV === 'development')) {
        return callback(null, {});
    }

    const worker = childprocess.fork(agentWorker, [
        JSON.stringify(options)
    ], {});
    const pid = worker.pid;

    worker.on('message', (message) => {
        const { action } = message;
        if (action === 'started') {
            callback(null, new KAgentWorker(worker));
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