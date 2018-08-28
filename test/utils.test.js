const assert = require('power-assert');
const pify = require('pify');
const exec = require('../lib/utils/exec');
const flat = require('../lib/utils/flat');
// const fs = require('../lib/utils/fs');
const toJSON = require('../lib/utils/to-json');
// const jsonToArray = require('../lib/utils/json-to-array');

describe('Metrix', function() {
    it('should exec', async function() {
        const results = await pify(exec)('echo 0');
        assert(Number(results) === 0)
        let e;
        try {
            await pify(exec)('echo 0 | asss', {});
        } catch(err) {
            e = err;
        }
        assert(e);
    });

    it('should flat', async function() {
        class Timer {
            hello() {}
        }
        const results = flat({
            hello: {
                x: {
                    y: {
                        y: {
                            z: 1221
                        }
                    },
                    z: new Timer()
                },
                // eslint-disable-next-line
                n: void 0,
                // eslint-disable-next-line
                m: null,
            }
        });
        assert(results.hello_x_y_y_z === 1221);
    });

    it('should toJSON', async function() {
        const results = toJSON({
            name: {
                toJSON() {
                    return {
                        hello: 'world'
                    }
                }
            },
            aaa() {
                            
            }
        });

        assert(toJSON(results).aaa === undefined);
    });
});