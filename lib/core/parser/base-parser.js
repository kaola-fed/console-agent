const Base = require('sdk-base');
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
    }

    get limit() {
        return this.options.limit || 0;
    }

    get name() {
        return this.options.name;
    }

    get file() {
        return this.options.file;
    }

    get cacheFile() {
        return path.join(this.options.rundir, 'metrix-' + this.name + '.json');
    }

    async _init() {
        if (!(await fs.exists(this.file))) {
            return;
        }

        let json = {};

        if (await fs.exists(this.cacheFile)) {
            json = await fs.readJSONFile(this.cacheFile, 'utf-8');
        }

        let { line = 0 } = json;

        const readable = createReadStream(this.file, {
            start: line, encoding: 'utf8'
        });
 
        const onData = function(data) {

            line += Buffer.byteLength(data);
        };
        readable.on('data', onData);
    
        return Promise.all(
            [
                this.parseStream(readable),
                new Promise((resolve, reject) => {
                    const onEnd = () => {
                        readable.removeListener('data', onData);
                        readable.removeListener('end', onEnd);
                        fs.rwrite(this.cacheFile, JSON.stringify({
                            line
                        })).then(resolve, reject);
                    };
                    readable.on('end', onEnd);
                })
            ]
        );
    }

    async parse() {
        throw new Error('Parser.parse is abstract');
    }

    execute(data) {
        this.pending += data;
        let index = this.pending.indexOf('\n');
        
        while (index !== -1) {
            const line = this.pending.slice(0, index);
            try {
                this.parse(line);
            } catch(e) {
                this.error.push(e);
            }
            
            this.pending = this.pending.slice(index + 1);
            index = this.pending.indexOf('\n');
        }
    }

    parseStream(readable) {
        const ctx = this;

        return new Promise((resolve, reject) => {
            function removeAllListeners() {
                // eslint-disable-next-line no-use-before-define
                readable.removeListener('data', onData);
                // eslint-disable-next-line no-use-before-define
                readable.removeListener('end', onEnd);
                // eslint-disable-next-line no-use-before-define
                readable.removeListener('error', onError);
            }
        
            function onData(data) {
                ctx.execute(data);
            }
        
            function onEnd() {
                removeAllListeners();
                // 如果最后不在堆栈中，丢弃剩余可能存在的额外数据
                // 保存最后解析到的这条日志
                resolve();
            }
        
            function onError(err) {
                removeAllListeners();
                reject(err);
            }
        
            readable.on('data', onData);
            readable.on('end', onEnd);
            readable.on('error', onError);
        });
    }
}
module.exports = Parser;