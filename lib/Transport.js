const INCLUDE_ALL = Symbol('Include all')
const EXCLUDE_ALL = Symbol('Exclude all')
const INCLUDE_LABELS = Symbol('Include labels')
const EXCLUDE_LABELS = Symbol('Exclude labels')

/**
 * @class
 * @name Transport
 */
class Transport {
    constructor() {
        this[INCLUDE_LABELS] = new Set()
        this[EXCLUDE_LABELS] = new Set()
    }

    /**
     * @param {String} label
     */
    includes(label) {
        return (
            this[INCLUDE_LABELS].has(label) ||
            (!this[EXCLUDE_LABELS].has(label) &&
                !(this[EXCLUDE_LABELS].size === 1 && this[EXCLUDE_LABELS].has(EXCLUDE_ALL)))
        )
    }

    /**
     * @param {String|Array<String>} label
     */
    include(label) {
        if (Array.isArray(label)) {
            label.forEach(l => this.include(l))
            return this
        }
        if (this[INCLUDE_LABELS].has(label)) return this
        if (this[INCLUDE_LABELS].has(INCLUDE_ALL)) this[INCLUDE_LABELS].delete(INCLUDE_ALL)
        if (this[EXCLUDE_LABELS].has(label)) this[EXCLUDE_LABELS].delete(label)
        if (!this[EXCLUDE_LABELS].size) this[EXCLUDE_LABELS].add(EXCLUDE_ALL)
        this[INCLUDE_LABELS].add(label)

        return this
    }

    includeAll() {
        this[INCLUDE_LABELS].clear()
        this[EXCLUDE_LABELS].clear()
        this[INCLUDE_LABELS].add(INCLUDE_ALL)
    }

    /**
     * @param {String|Array<String>} label
     */
    exclude(label) {
        if (Array.isArray(label)) {
            label.forEach(l => this.exclude(l))
            return this
        }
        if (this[EXCLUDE_LABELS].has(label)) return this
        if (this[EXCLUDE_LABELS].has(EXCLUDE_ALL)) this[EXCLUDE_LABELS].delete(EXCLUDE_ALL)
        if (this[INCLUDE_LABELS].has(label)) this[INCLUDE_LABELS].delete(label)
        if (!this[INCLUDE_LABELS].size) this[INCLUDE_LABELS].add(INCLUDE_ALL)
        this[EXCLUDE_LABELS].add(label)

        return this
    }

    excludeAll() {
        this[INCLUDE_LABELS].clear()
        this[EXCLUDE_LABELS].clear()
        this[EXCLUDE_LABELS].add(EXCLUDE_ALL)
    }

    /**
     * @param {import('./Message')} msg
     */
    log(msg) {
        console.log(msg)
    }

    /**
     * @param {import('./Message')} msg
     */
    async hook(msg) {}

    async init() {}
    async stop() {}
}

module.exports = Transport
