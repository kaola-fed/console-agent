class Meter {
    /**
     * @param {MeterProperties} [properties] see {@link MeterProperties}.
     */
    constructor(properties) {
        this._properties = properties || {};
        this._initializeState();
    }

    get duration() {
        return this._properties.duration;
    }

    /**
     * Initializes the state of this Metric
     * @private
     */
    _initializeState() {
        this._count = 0;
    }

    /**
     * Register n events as having just occured. Defaults to 1.
     * @param {number} [n]
     */
    mark(n = 1) {
        this._count += n;
    }

    /**
     * Resets all values. Meters initialized with custom options will be reset to the default settings (patch welcome).
     */
    reset() {
        this._initializeState();
    }

    /**
     * The type of the Metric Impl. {@link MetricTypes}.
     * @return {string} The type of the Metric Impl.
     */
    getType() {
        return 'Meter';
    }

    toJSON() {
        return {
            rate: (this._count === 0) ? 0 : (this._count / this.duration),
            count: this._count
        };
    }
}

module.exports = Meter;