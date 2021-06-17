// const PATH_REGEXP = /(?<d>(\/[a-z0-9A-Z\.\-\_]+)+)(?<ext>\.[a-z0-9]{1,4})/

class Context {
    /**
     * @param {String} [category]
     * @param {Object} [ctx]
     */
    constructor(category, ctx) {
        this.category = category

        Object.assign(this, ctx)

        /**
         * @type {string[]}
         * @public
         */
        this.groups = []

        /**
         * @public
         * @type {string?}
         */
        this.group = null
    }

    /**
     * @param {String} groupName
     * @returns {Context}
     */
    setGroup(groupName) {
        if (!groupName) return this
        this.groups.push(groupName)
        this.group = groupName
        return this
    }

    /**
     * @param {String} groupName
     * @returns {Context}
     */
    removeGroup(groupName) {
        if (!groupName) return this
        const idx = this.groups.lastIndexOf(groupName)
        if (idx >= 0) {
            this.groups.splice(idx)
            this.group = this.groups[this.groups.length - 1] || null
        }

        return this
    }

    /**
     * @returns {Context}
     */
    clone() {
        const { category, groups } = this
        const ctx = new Context(category, this)
        groups.forEach(group => ctx.setGroup(group))
        return ctx
    }
}

module.exports = Context
