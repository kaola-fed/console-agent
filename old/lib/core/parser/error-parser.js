'use strict';

const Parser = require('./abstract-parser');

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
}


class ErrorParser extends Parser {
    constructor(options) {
        super(options);
        
        this.startTest = options.startTest || /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) - [a-zA-Z0-9_]+ - [^-]+ - [a-zA-Z0-9_]+ \[\d+\] (.*)$/;

        this.reset();
    }
    
    reset() {
        this.list = [];
        this.current = null;
    }

    getResult() {
        const logs = this.list;
        this.reset();

        const error = Array.from(
            logs.reduce(
                (map, item = {}) => {
                    const name = `${item.type}: ${item.message}`;

                    if (!map.has(name)) {
                        map.set(name, Object.assign({}, item, { count: 0 }));
                    }

                    map.get(name).count += 1;

                    return map;
                }, new Map()
            ).values()
        );

        return {
            error
        };
    }

    expect(line, startWith) {
        return line.trim().includes(startWith);
    }
    
    pushLog() {
        if (this.current) {
            this.list.push(this.current);
        }
        this.current = null;
    }

    async _init() {
        await super._init()
        
        if (this.current) {
            this.pushLog();
        }
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
                const message = line.slice(match.index + ((match && match[0]) || '').length);

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