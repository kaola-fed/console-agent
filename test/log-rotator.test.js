// const assert = require('power-assert');
const path = require('path');
const logRotator = require('../lib/core/tasks/log-rotator');
const cleanLog = require('../lib/core/tasks/clean-log');

describe('Agent', function() {
    before(async function() {
        
    })

    it('should rotate log', async function() {
        await logRotator.doTask({
            files: {
                'built-in': path.join(__dirname, 'fixtures/agentk/built-in.log'),
                application: path.join(__dirname, 'fixtures/agentk/application.log'),
                error: path.join(__dirname, 'fixtures/common-error.log')
            }
        })
    });


    it('should clean log', async function() {
        await cleanLog.doTask({
            rundir: path.join(__dirname, 'fixtures/run'),
            rootdir: path.join(require('os').homedir(), 'kagent', 'kagent-test')
        })
    });

    after(function() {
        // agentK.stop();
    })
});