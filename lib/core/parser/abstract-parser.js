const Base = require('sdk-base');
const pify = require('pify');
const path = require('path');
const fs = require('../../utils/fs');
const { createReadStream } = require('fs');

class Parser extends Base {
    constructor(options) {
        super(Object.assign({}, options, {
            initMethod: '_init'
        }));

        this.pending = '';
        this.error = [];
        this.processed = 0;
    }

    get limit() {
        return this.options.limit || 1000 * 50;
    }

    get name() {
        return this.options.name;
    }

    get file() {
        return this.options.file;
    }

    get cacheFile() {
        return path.join(this.options.rundir, 'kagent-' + this.name + '.json');
    }

    get logger() {
        return this.options.logger;
    }

    isOverLimit() {
        return this.processed > this.limit;
    }

    getResult() {
        throw new Error('Parser.getResult is abstract');
    }

    async _init() {
        if (!(await fs.exists(this.file))) {
            return;
        }

        let json = {};

        if (await fs.exists(this.cacheFile)) {
            json = await fs.readJSONFile(this.cacheFile, 'utf-8');
        }

        let { start = 0 } = json;

        const stream = createReadStream(this.file, {
            start, encoding: 'utf8'
        });
        const stats = await fs.lstat(this.file);

        if (start > stats.size) {
            start = 0;
        }
 
        this.parseStream(stream, (e, data) => {
            if (e) {
                this.logger.error(e);
                if (stream.readable) {
                    stream.close();
                }
            } else {
                start += Buffer.byteLength(data);
            }

            if (this.isOverLimit()) {
                stream.close()
            }
        });

        const waitEnd = (callback) => {
            const onEnd = () => {
                callback();
                stream.removeAllListeners();
            };
            stream.on('end', onEnd);
        }

        return pify(waitEnd)().then(() => fs.rwrite(this.cacheFile, JSON.stringify({ start })));
    }

    async parse() {
        throw new Error('Parser.parse is abstract');
    }

    execute(data) {
        this.pending += data;
        let index = this.pending.indexOf('\n');
        
        while (index !== -1) {
            const start = this.pending.slice(0, index);

            this.processed += 1;

            try {
                this.parse(start);
            } catch(e) {
                this.error.push(e);
            }
            
            this.pending = this.pending.slice(index + 1);
            index = this.pending.indexOf('\n');
        }
    }

    parseStream(stream, callback) {
        const that = this;
        
        function onData(data) {
            that.execute(data);
            callback(null, data);
        }
        
        function onError(err) {
            callback(err);
        }

        stream.on('data', onData);
        stream.on('error', onError);
    }
}
module.exports = Parser;