const exec = require('../../utils/exec');
const pify = require('pify');
const pidusage = require('pidusage');
const trim = (str) => {
    return str.replace(/(^\s*)|(\s*$)/g, '');
};

// exports.interval = 60 * 1000;

exports.getMetric = async function() {
    // const { name } = options;
    const stdout = await pify(exec)('ps', []);

    const processes = trim(stdout)
        .split('\n')
        .map(item => trim(item).replace(/\s+/g, ' ').split(' '))
        .filter(list => {
            return list[3].includes('node') || list[3].includes('npm');
        });
    
    const cmdAndArgs = processes.reduce((prev, p) => Object.assign(prev, {
        [p[0]]: {
            cmd: p[3],
            file: p[4],
            args: p[5]
        }
    }), {});

    const pids = processes.map(list => list[0]);

    const list = await pify(pidusage)(pids);

    const returnJSON = {};

    for (let pid of pids) {
        returnJSON[pid] = Object.assign({}, cmdAndArgs[pid], list[pid]);
    }

    return {
        process: returnJSON
    };
};