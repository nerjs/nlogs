const moment = require('moment')
const merge = require('merge')
const prettyTime = require('pretty-time')
const Transport = require('../Transport')

/**
 * @typedef ConsoleTransportConfig
 * @property {"minute"|"hour"|"dayOfYear"|false} [timeGroup]
 * @property {String} [shortTimeFormat]
 * @property {String} [timeFormat]
 * @property {String} [longTimeFormat]
 * @property {Boolean} [showModuleName]
 * @property {Boolean} [showFile]
 */
const defConfig = {
    timeGroup: 'hour', // minute, hour, dayOfYear
    shortTimeFormat: '..HH:mm:ss',
    timeFormat: null,
    longTimeFormat: 'D/M/YYYY HH:mm:ss',
    showModuleName: false,
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
        return [this.getTimePrefix(msg), this.getPathPrefix(msg), this.getLabelPrefix(msg)].flat()
    }

    /**
     * @param {import("../Message")} msg
     * @returns {String[]}
     */
    getTimePrefix(msg) {
        const { timeGroup, timeFormat, shortTimeFormat, longTimeFormat } = this.config
        const cur = moment(msg.time)
        const prev = moment(msg.prevTime)
        const isLong = timeGroup && cur[timeGroup]() !== prev[timeGroup]()
        const format = timeGroup
            ? isLong
                ? longTimeFormat
                : shortTimeFormat
            : timeFormat || longTimeFormat || shortTimeFormat
        const timeStr = cur.format(format)

        return this.style(`${isLong ? '' : ' '}${timeStr}`, 'time')
    }

    /**
     * @param {import("../Message")} msg
     * @returns {String}
     */
    getLabelPrefix(msg) {
        return this.style(msg.label, msg.label)
    }

    /**
     * @param {import("../Message")} msg
     * @returns {String[]}
     */
    getPathPrefix(msg) {
        const { showModuleName, showFile } = this.config
        const res = []

        if (showFile) {
            if (msg.context.filename) {
                const fileArr = msg.context.filename.split('/')
                const lastSegment = fileArr.pop()
                res.push(
                    this.style(`${fileArr.join('/')}/`, 'segment'),
                    this.style(lastSegment, 'lastSegment'),
                )
            }
        } else {
            res.push(
                ...msg.context.groups.map((group, i) =>
                    this.style(
                        group,
                        i === msg.context.groups.length - 1 ? 'lastSegment' : 'segment',
                    ),
                ),
            )

            if (msg.context.category) res.unshift(this.style(msg.context.category, 'firstSegment'))
        }

        if (msg.context.module && showModuleName)
            res.unshift(this.style(msg.context.module, 'firstSegment'))

        return res
    }

    /**
     *
     * @param {String} name
     * @param {String|Number} value
     * @param {String} [msg]
     */
    getMeta(name, value, msg) {
        const res = [this.style(`${name}:`, 'metaName'), this.style(`${value}`, 'metaValue')]

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
