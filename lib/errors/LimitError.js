class LimitError extends Error {
    constructor(message, limit = 0, units) {
        const msg = `[${limit}${units ? ` ${units}` : ''}] ${message || ''}`
        super(msg)
        this.limit = limit
        this.units = units

        this.name = 'LimitError'
    }
}

module.exports = LimitError
