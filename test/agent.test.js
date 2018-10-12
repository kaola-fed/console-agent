const assert = require('power-assert');
const path = require('path');
const { KAgent } = require('../');
const fs = require('../lib/utils/fs');

describe('Agent', function() {
    let kAgent;

    before(async function() {
        await fs.del(path.join(__dirname, 'fixtures/run'))
        kAgent = new KAgent({
            name: 'kagent-test',
            reporter: ['filesystem'],
            tasks: [
            ],
            rundir: path.join(__dirname, 'fixtures/run'),
            files: {
                'built-in': path.join(__dirname, 'fixtures/kagent/built-in.log'),
                application: path.join(__dirname, 'fixtures/kagent/application.log'),
                error: path.join(__dirname, 'fixtures/common-error.log')
            }
        });
    })

    it('should collect results', async function() {
        await kAgent.ready()
        const results = await kAgent.collect();

        assert(results.length > 0);

        kAgent.report(results);
    });

    it('should kagent fireOnTick', async function() {
        for (let cron of kAgent.cron) {
            cron.fireOnTick();
        }
    });

    after(function() {
        kAgent.stop();
    })
});