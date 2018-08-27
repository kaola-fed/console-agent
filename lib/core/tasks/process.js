const exec = require('../../utils/exec');
const pify = require('pify');
const pidusage = require('pidusage');
const trim = (str) => {
    return str.replace(/(^\s*)|(\s*$)/g, '');
};

// exports.interval = 60 * 1000;

exports.getMetric = async function() {
    // const { name } = options;
    const stdout = await pify(exec)('ps -ef | grep node', []);

    const processes = trim(stdout)
        .split('\n')
        .map(item => trim(item).replace(/\s+/g, ' ').split(' '))
        .filter(list => {
            const command = list[7];
            return command.includes('node') || command.includes('npm');
        })
        .sort((a, b) => {
            return a[8] < b[8];
        })
        .map(([, pid, , , , , , ...rest] = []) => {
            return {
                pid, 
                commands: rest.join(' ')
            }
        });

    const cmdAndArgs = processes.reduce((prev, p) => Object.assign(prev, {
        [p.pid]: {
            cmd: p.commands
        }
    }), {});

    const pids = processes.map(list => list.pid);

    const list = await pify(pidusage)(pids);

    const returnJSON = {};

    let id = 0;
    for (let pid of pids) {
        id += 1;
        returnJSON[id] = Object.assign({}, cmdAndArgs[pid], list[pid]);
    }

    return {
        process: returnJSON
    };
};