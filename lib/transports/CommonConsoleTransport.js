const moment = require('moment')
const merge = require('merge')
const prettyTime = require('pretty-time')
const Transport = require('../Transport')

/**
 * @typedef ConsoleTransportConfig
 * @property {"minute"|"hour"|"dayOfYear"|false} [timeGroup]
 * @property {String} [shortTimeFormat]
 * @property {String} [longTimeFormat]
 * @property {Boolean} [showModuleName]
 * @property {Boolean} [showFile]
 */
const defConfig = {
    timeGroup: 'hour', // minute, hour, dayOfYear
    shortTimeFormat: '..HH:mm:ss',
    longTimeFormat: 'D/M/YYYY HH:mm:ss',
    showModuleName: true,
    showFile: false,
}

class CommonConsoleTransport extends Transport {
    /**
     * @param {ConsoleTransportConfig} config
     */
    constructor(config = {}) {
        super(config)
        this.config = merge(true, defConfig, config)

        if (!['minute', 'hour', 'dayOfYear'].includes(this.config.timeGroup)) {
            this.config.timeGroup = false
        }
    }

    /**
     *
     * @param {import("../Message")} msg
     */
    log(msg) {
        const prefix = this.getPrefix(msg)

        switch (msg.label) {
            case 'table':
                if (msg.message) prefix.push(msg.message)
                console.log(...prefix)
                console.table(...msg.fullDetails)
                break
            case 'dir':
                if (msg.message) prefix.push(msg.message)
                console.log(...prefix)
                console.dir(msg.details, {
                    depth: msg.depth || 5,
                })
                break
            case 'count':
            case 'timeLog':
            case 'timeEnd':
                console.log(
                    ...prefix,
                    ...this.getMeta(
                        msg.data[0],
                        msg.label === 'count' ? msg.data[1] : this.prettyTime(msg.data[1]),
                        msg.data[2],
                    ),
                )
                break
            case 'trace':
                if (msg.message) prefix.push(msg.message)
                console.log(...prefix)
                console.log(msg.data[0].map(({ origin }) => `\t${origin}`).join('\n'))
                break
            default:
                const method =
                    msg.label === 'fatal'
                        ? 'error'
                        : ['log', 'info', 'warn', 'error'].find(l => msg.label === l) || 'log'
                const msgs = []
                if (msg.message) msgs.push(msg.message)
                if (msg.details) msgs.push(msg.details)
                console[method](...prefix, ...msgs)
                break
        }
    }

    /**
     * @param {import("../Message")} msg
     * @returns {String[]}
     */
    getPrefix(msg) {
        const res = []
        const timePrefix = this.getTimePrefix(msg)

        res.push(...timePrefix.map(str => this.style(str, 'time')))
        if (timePrefix.length === 2) {
            res.splice(1, 0, '\n')
        }

        const nameSegments = this.getNamePrefix(msg)

        res.push(
            ...nameSegments.map((str, i) =>
                this.style(
                    str,
                    i === 0 && nameSegments.length > 1
                        ? 'firstSegment'
                        : i === nameSegments.length - 1
                        ? 'lastSegment'
                        : 'segment',
                ),
            ),
        )

        const labelPrefix = this.getLabelPrefix(msg)
        res.push(this.style(labelPrefix, msg.label))

        return res.flat()
    }

    /**
     * @param {import("../Message")} msg
     * @returns {String[]}
     */
    getTimePrefix(msg) {
        const { timeGroup, shortTimeFormat, longTimeFormat } = this.config
        const cur = moment(msg.time)
        const prev = moment(msg.prevTime)

        const res = [cur.format(timeGroup || !longTimeFormat ? shortTimeFormat : longTimeFormat)]

        if (timeGroup && cur[timeGroup]() !== prev[timeGroup]()) {
            res.unshift(cur.format(longTimeFormat))
        }

        return res
    }

    /**
     * @param {import("../Message")} msg
     * @returns {String}
     */
    getLabelPrefix(msg) {
        return msg.label
    }

    /**
     * @param {import("../Message")} msg
     * @returns {String[]}
     */
    getNamePrefix(msg) {
        const { showModuleName, showFile } = this.config
        const res = []
        if (msg.context.module && showModuleName) res.push(msg.context.module)
        if (showFile && msg.context.filename) {
            const fileArr = msg.context.filename.split('/')
            const lastSegment = fileArr.pop()
            res.push(`${fileArr.join('/')}/`, lastSegment)
        } else {
            if (msg.context.category) res.push(msg.context.category)
            if (msg.context.group) res.push(msg.context.group)
        }

        return res
    }

    /**
     *
     * @param {String} name
     * @param {String|Number} value
     * @param {String} [msg]
     */
    getMeta(name, value, msg) {
        const res = [this.style(`${name} :: `, 'metaName'), this.style(`${value}`, 'metaValue')]

        if (msg) res.push(`${msg}`)
        return res
    }

    /**
     * @param {String} str
     * @param {String} styleName
     * @returns {String[]}
     */
    style(str, styleName) {
        return `[${str}]`
    }

    /**
     *
     * @param {Number} time
     * @returns {String}
     */
    prettyTime(time) {
        return prettyTime(1000000 * time, 'ms')
    }
}

module.exports = CommonConsoleTransport
