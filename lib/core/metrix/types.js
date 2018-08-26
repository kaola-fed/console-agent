const MetrixTypes = {
    counter: 'Counter',
    histogram: 'Histogram',
    meter: 'Meter',
    timer: 'Timer',
    guage: 'SettableGauge'
};

const CounterMetrixMethods = {
    inc: 'inc',
    dec: 'dec'
};

const HistogramMetrixMethods = {
    update: 'update'
};

const MeterMethods = {
    mark: 'mark'
};

const TimerMethods = {
    start: 'start',
    end: 'end',
    update: 'update'
};

const GuageMethods = {
    setValue: 'setValue',
    setGetter: 'setGetter'
};

module.exports = {
    MetrixTypes,
    CounterMetrixMethods,
    HistogramMetrixMethods,
    MeterMethods,
    TimerMethods,
    GuageMethods
};
