const fs = require('../../utils/fs');
const path = require('path');
const { KAGENT_RESULTS_PREFIX } = require('../consts');
const ONE_DAY = 24 * 60 * 60 * 1000;


exports.cron = '0 0 0 * * *';

exports.doTask = async function(options = {}) {
    const { rundir, rootdir = '' } = options;

    try {
        await fs.del(path.join(rundir, 'kagent-*'), {
            force: true
        });
    } catch(e) {
        options.logger.error(e);
    }

    let list;

    try {
        list = await fs.readdir(rootdir);
    } catch(e) {
        options.logger.error(e);
    }

    const cleanLogTime = Date.now() - ONE_DAY;
    const cleanLogDateTemp = new Date(cleanLogTime);
    const cleanLogDate = [
        cleanLogDateTemp.getFullYear(),
        cleanLogDateTemp.getMonth() + 1,
        cleanLogDateTemp.getDate(), cleanLogDateTemp.getHours(),
        cleanLogDateTemp.getMinutes()
    ];

    const results = list.map(item => {
        const date = item.replace(KAGENT_RESULTS_PREFIX, '')
            .replace(/\.json$/, '')
            .replace(/[-_]/g, ' ')
            .split(' ');
        return {
            filename: item,
            date
        }
    })
        .filter(({date}) => {
            return date.some((item, index) => {
                return item < cleanLogDate[index]
            });
        })
        .map(({filename}) => path.join(rootdir, filename));

    try {
        await fs.del(results, {force: true})
    } catch(e) {
        options.logger.error(e);
    }
}