const fs = require('../../utils/fs');
const getDate = require('../../utils/get-date');

exports.cron = '0 0 0 * * *';

function createStream(file) {
    const readStream = fs.createReadStream(file);
    const writeStream = fs.createWriteStream([file, getDate()].join('.'));
    readStream.pipe(writeStream);
    return writeStream;
}

exports.doTask = async function(options = {}) {
    const { files } = options;

    await Promise.all(
        Object.entries(files)
            .filter(([name]) => name !== 'error')
            .map(([, file]) => {
                return new Promise(
                    (resolve, reject) => {
                        const stream = createStream(file);
                        stream.on('close', () => {
                            fs.truncate(file, 0).then(() => resolve());
                        });
                        stream.on('error', reject);
                    });
            })
    );
}