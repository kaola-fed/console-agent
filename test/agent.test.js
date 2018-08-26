const assert = require('power-assert');
const path = require('path');
const { AgentK } = require('../');
const fs = require('../lib/utils/fs');

describe('Agent', function() {
    let agentK;

    before(async function() {
        await fs.del(path.join(__dirname, 'fixtures/run'))
        agentK = new AgentK({
            reporter: ['filesystem'],
            tasks: [],
            rundir: path.join(__dirname, 'fixtures/run'),
            files: {
                'built-in': path.join(__dirname, 'fixtures/agentk/built-in.log'),
                application: path.join(__dirname, 'fixtures/agentk/application.log'),
                error: path.join(__dirname, 'fixtures/common-error.log')
            }
        });
    })

    it('should collect results', async function() {
        await agentK.ready()
        const results = await agentK.collect();

        assert(results.length > 0);

        agentK.report(results);
    });

    after(function() {
        agentK.stop();
    })
});