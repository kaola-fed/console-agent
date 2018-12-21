const Base = require('sdk-base');
const pify = require('pify');
const path = require('path');
const { exists, readyFile, lstat, mkdir, writeFile } = require('../fs');
const { createReadStream } = require('fs');

class LogParser extends Base {
  constructor(options) {
    super(Object.assign({}, options, {
      initMethod: '_init'
    }));

    this.pending = '';
    this.error = [];
    this.processed = 0;
  }

  get limit() {
    return this.options.limit;
  }

  get name() {
    return this.options.name;
  }

  get file() {
    return this.options.file;
  }

  get rundir() {
    return this.options.rundir || path.join(process.cwd(), 'run');
  }

  get cacheFile() {
    return path.join(this.rundir, 'console-agent-' + this.name + '.json');
  }

  get logger() {
    return this.options.logger;
  }

  isOverLimit() {
    return this.limit && (this.processed > this.limit);
  }

  getResult() {
    throw new Error('Parser.getResult is abstract');
  }

  async _init() {
    if (!await exists(this.file)) {
      return;
    }

    let json = {};

    if (await exists(this.cacheFile)) {
      const content = await readyFile(this.cacheFile, 'utf-8');
      try {
        json = JSON.parse(content);
      } catch(e) {
        this.logger.error(e);
      }
    }

    let { start = 0 } = json;

    const stream = createReadStream(this.file, {
      start, encoding: 'utf8'
    });
    const stats = await lstat(this.file);

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


    await pify((callback) => {
      stream.on('close', () => {
        stream.removeAllListeners();
        callback();
      });
    })()

    const dir = path.parse(this.cacheFile).dir;
    
    if (!await exists(dir)) {
      mkdir(dir);
    }

    await writeFile(this.cacheFile,
      JSON.stringify({
        start
      })
    );
    
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
      } catch (e) {
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

module.exports = LogParser;