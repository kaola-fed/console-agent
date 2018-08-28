const fs = require('../../utils/fs');
const path = require('path');

exports.cron = '0 0 0 * * *';


exports.doTask = async function(options = {}) {
    const { rundir } = options;
    await fs.del(path.join(rundir, 'kagent-*'));
}