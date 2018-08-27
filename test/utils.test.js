const assert = require('power-assert');
const pify = require('pify');
const exec = require('../lib/utils/exec');
// const flat = require('../lib/utils/flat');
// const fs = require('../lib/utils/fs');
// const jsonToArray = require('../lib/utils/json-to-array');

describe('Metrix', function() {
    it('should exec', async function() {
        const results = await pify(exec)('echo 0', {});
        assert(Number(results) === 0)
    });

    it('should flat', async function() {
        // const results = flat();
        // assert(Number(results) === 0)
    });
});