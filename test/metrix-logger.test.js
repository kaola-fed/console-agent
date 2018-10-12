const assert = require('power-assert');
const path = require('path');
const { Metrix, start } = require('../');
const fs = require('../lib/utils/fs');

const wait = function(seconds = 0) {
    return new Promise(function(resolve) {
        setTimeout(resolve, seconds);
    })
}

describe('Metrix', function() {
    let kAgent;
    let metrix;
    const options = {
        name: 'appName',
        reporter: ['filesystem'],
        tasks: [],
        rundir: path.join(__dirname, 'fixtures/run'),
        flushInterval: 1000,
        files: {
            'built-in': path.join(__dirname, 'fixtures/kagent/built-in.log'),
            application: path.join(__dirname, 'fixtures/kagent/application.log'),
            error: path.join(__dirname, 'fixtures/common-error.log')
        }
    }

    before(async function() {
        await fs.del(path.join(__dirname, 'fixtures/run'))
        kAgent = await start(options);
        
        metrix = new Metrix(Object.assign({
            logger: console
        }, options));
        await metrix.ready();
    })

    it('should counter', async function() {
        const counter = metrix.getCounter();
        counter.inc();
        metrix.addMetric(['a', 'b'], counter);
    });


    it('should getTimer', async function() {
        const timer = metrix.getTimer();
        timer.end();
        metrix.addMetric(['c', 'd'], timer);
    });


    it('should getGuage', async function() {
        const guage = metrix.getGuage();
        guage.setValue(1);
        metrix.addMetric(['e', 'f'], guage);
    });

    it('should getHistogram', async function() {
        const histogram = metrix.getHistogram();
        histogram.update(1);
        metrix.addMetric(['g', 'h'], histogram);
    });

    it('should getMeter', async function() {
        const meter = metrix.getMeter();
        meter.mark();
        metrix.addMetric(['i', 'j'], meter);
    });

    it('should collect', async function() {
        await wait(1000);
        const rs = await kAgent.collect();
        const m = rs[0];
        assert(m.a.b === 1);
        assert(m.c.d.meter.count === 1);
        assert(m.c.d.histogram.count === 1);
        assert(m.e.f === 1);
        assert(m.g.h.count === 1);
        assert(m.i.j.count === 1);
        assert(rs.length > 0);
    });

    it('should report', async function() {
        const rs = await kAgent.report();
        assert(rs.filesystem.data.process.length > 0);
    });

    after(function() {
        kAgent.kill();
        metrix.stop();
    })
});