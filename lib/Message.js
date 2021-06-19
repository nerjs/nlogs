/**
 * @class
 * @name Message
 */
class Message {
    /**
     *
     * @param {import("./Context")} ctx
     * @param {String} label
     * @param {any[]} [data]
     */
    constructor(ctx, label, data = []) {
        this.context = ctx
        this.label = label
        this.data = data
        this.time = Date.now()
        this.prevTime = Message.lastTime
    }

    /**
     * @returns {Number}
     */
    get deltaTime() {
        return this.time - this.prevTime
    }

    get message() {
        if (!this.data || !Array.isArray(this.data) || !this.data.length) return ''
        return this.data
            .map(val => {
                if (['string', 'number', 'boolean'].includes(typeof val)) return `${val}`
                if (val instanceof Error) return val.message
                if (val instanceof Date) return val.toGMTString()
                return null
            })
            .filter(v => !!v)
            .join('.  ')
    }

    get fullDetails() {
        if (!this.data || !Array.isArray(this.data) || !this.data.length) return []
        return this.data.filter(val => typeof val === 'object' && !(val instanceof Date))
    }

    get details() {
        return Object.assign({}, ...this.fullDetails)
    }

    get exportData() {
        const { category, filename, group, groups, groupsPath, path } = this.context
        const { label, time } = this

        return {
            label,
            category,
            module: this.context.module,
            groupsPath,
            path,
            group,
            filename,
            groups,
            time,
        }
    }

    static get lastTime() {
        const lt = this.__lastTime || 1
        this.__lastTime = Date.now()
        return lt
    }
}

module.exports = Message
