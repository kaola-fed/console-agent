'use strict';

const Parser = require('./base-parser');

class ErrorLog {
    constructor({
        type = 'Error',
        message = '',
        timestamp = new Date()
    } = {}) {
        this.type = type;
        this.message = message;
        this.extra = '';
        this.stack = '';
        this.timestamp = String(timestamp);
    }

    serialize() {
        return JSON.stringify(this);
    }
}


class ErrorParser extends Parser {
    constructor(options) {
        super(options);
        this.list = [];
        this.current = null;
        this.startTest = options.startTest || /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) - [a-zA-Z0-9_]+ - [^-]+ - [a-zA-Z0-9_]+ \[\d+\] (.*)$/;
    }

    get result() {
        return {
            error: this.list
        };
    }

    expect(line, startWith) {
        return line.trim().includes(startWith);
    }
    
    pushLog() {
        if (this.current) {
            this.list.push(this.current);
            if (this.limit > 0 && this.limit < this.list.length) {
                this.list.shift(); // 删掉前面的
            }
        }
        this.current = null;
    }

    parseStream(readable) {
        return super.parseStream(readable)
            .then(() => {
                if (this.current) {
                    this.pushLog();
                }
            });
    }

    parse(line) {
        line = line.trim();

        if (line === '') { // 空行
            this.pushLog();
            return;
        } 
        
        if (this.startTest.test(line)) {
            if (this.current) {
                this.pushLog();
            }

            const content = RegExp.$2;
            const timestamp = new Date((RegExp.$1 || '').replace(/,\d+$/, ''));

            if (line.match(/Error: /)) {
                const match = line.match(/([A-z]*Error): /);
                const name = match && match[1];
                const message = line.slice(match.index + (name || '').length);

                this.current = new ErrorLog({
                    type: name,
                    message: message,
                    timestamp
                });
            } else {
                this.current = new ErrorLog({
                    message: content,
                    timestamp
                });
            }
            return;
        } 

        if (this.expect(line, 'at ')) {
            if (this.current) {
                this.current.stack += line + '\n';
                return;
            }
        } 

        if (this.current) {
            this.current.extra += line + '\n'; // 不明确的数据，暂时存放
        }
    }
}

module.exports = ErrorParser;