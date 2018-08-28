const assert = require('power-assert');
const Meter = require('../lib/core/metrix/meter');
const Timer = require('../lib/core/metrix/timer');
const clearIntervals = require('@segment/clear-intervals');

describe('Metrix', function() {
    before(async function() {
        
    })

    it('should Meter works', async function() {
        const meter = new Meter({
            duration: 1
        });
        meter.mark();
        assert(meter.toJSON().count === 1)
        assert(meter.toJSON().rate === 1)
    });

    it('should Timer works', async function() {
        const timer = new Timer({
            duration: 1
        });
        timer.update(1000);

        assert(timer.toJSON().meter.count === 1);
        assert(timer.toJSON().meter.rate === 1);
        assert(timer.toJSON().histogram.min === 1000);
        assert(timer.toJSON().histogram.max === 1000);
    });

    after(function() {
        clearIntervals();
    })
});