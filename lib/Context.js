class Context {
    /**
     * @param {String} [category]
     * @param {Object} [ctx]
     */
    constructor(ctx) {
        /**
         * @type {String?}
         * @public
         */
        this.module = null

        /**
         * @type {String}
         * @public
         */
        this.category = null

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

        /**
         * @public
         * @type {string?}
         */
        this.filename = null

        Object.assign(this, ctx)
    }

    get path() {
        return `${this.module || '@'}/${this.filename}`
    }

    get groupsPath() {
        return `${this.module || '@'}.${this.category || '@'}${
            this.groups.length ? `.${this.groups.join('.')}` : ''
        }`
    }

    toJSON() {
        return {
            ...this,
            path: this.path,
            groupsPath: this.groupsPath,
        }
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
        if (!groupName) return this.group ? this.removeGroup(this.group) : this
        const idx = this.groups.lastIndexOf(groupName)
        if (idx >= 0) {
            this.groups.splice(idx)
            this.group = this.groups[this.groups.length - 1] || null
        }

        return this
    }

    setFilename(filename) {
        this.filename = filename
    }

    /**
     * @returns {Context}
     */
    clone() {
        const { category, filename, groups } = this
        const ctx = new Context(category, this)
        ctx.setFilename(filename)
        groups.forEach(group => ctx.setGroup(group))
        return ctx
    }
}

module.exports = Context
