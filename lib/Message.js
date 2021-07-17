/**
 * @class
 * @name Message
 */
const parseTrace = require('./utils/parseTrace')

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
        switch (this.label) {
            case 'count':
            case 'time':
            case 'timeLog':
            case 'timeEnd':
                return `${this.data[0]}: ${this.data[1]}${this.data[2] ? ` | ${this.data[2]}` : ''}`
        }

        if (!this.data || !Array.isArray(this.data) || !this.data.length) return ''
        return this.data
            .map(val => {
                if (['string', 'number', 'boolean'].includes(typeof val)) return `${val}`
                if (val instanceof Error) return `${val}`
                if (val instanceof Date) return val.toGMTString()
                return null
            })
            .filter(v => !!v)
            .join(' | ')
    }

    get fullDetails() {
        if (!this.data || !Array.isArray(this.data) || !this.data.length) return []
        return this.data.filter(
            val => typeof val === 'object' && !(val instanceof Date) && !(val instanceof Error),
        )
    }

    get errors() {
        return this.data
            .filter(e => e instanceof Error)
            .map(e => ({
                name: e.name,
                message: e.message,
                stack: parseTrace(e.stack).map(({ origin }) => origin),
                ...e,
            }))
    }

    get hasDetails() {
        return (
            !!this.fullDetails.length ||
            !!this.errors.length ||
            ['count', 'time', 'timeLog', 'timeEnd'].includes(this.label)
        )
    }

    get details() {
        switch (this.label) {
            case 'count':
            case 'time':
            case 'timeLog':
            case 'timeEnd':
                return {
                    name: this.data[0],
                    [this.label === 'count'
                        ? 'count'
                        : this.label === 'time'
                        ? 'time'
                        : 'ms']: +this.data[1],
                }
            case 'table':
            case 'dir':
                return this.fullDetails.some(a => Array.isArray(a))
                    ? this.fullDetails.reduce((acc, cur, i) => {
                          acc[`${this.label}${i ? i : ''}`] = cur
                          return acc
                      }, {})
                    : Object.assign({}, ...this.fullDetails)
            case 'trace':
                return { stack: this.fullDetails[0] }
        }

        const { errors } = this
        const det = Object.assign({}, ...this.fullDetails)

        if (!errors.length) return det
        if (errors.length === 1) return Object.assign(det, errors[0])
        return Object.assign(det, { errors })
    }

    get meta() {
        const { label, time } = this

        return {
            ...this.context,
            label,
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
