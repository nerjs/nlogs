const moment = require('moment')
const path = require('path')
const terminalLink = require('terminal-link')
const Config = require('./config')
const { GROUP_TIME } = require('./constants')

class NLoggerCore {
    constructor(mod, config) {
        this.config = new Config(mod, config)

        this.lastLog = moment(0)
        this.cacheSegments = new Map()
    }

    getMethod(label) {
        const { methods } = this.config.config

        return methods[label] || {}
    }

    formatStr(...args) {
        return this.config.formatter.string(...args)
    }

    formatTime(...args) {
        return this.config.formatter.time(...args)
    }

    groupedEveryTime() {
        if (!this.config.config.groupedEveryTime) return
        const curTime = moment()
        const { formatter, time } = this.config.config
        let momentMethod = ''

        switch (this.config.config.groupedEveryTime) {
            case GROUP_TIME.MINUTE:
                momentMethod = 'minute'
                break
            case GROUP_TIME.HOUR:
                momentMethod = 'hour'
                break
            case GROUP_TIME.DAY:
                momentMethod = 'dayOfYear'
                break
            default:
                return
        }

        if (this.lastLog[momentMethod]() !== curTime[momentMethod]()) {
            console.log(formatter.string(formatter.time(curTime), time))
        }

        this.lastLog = curTime
    }

    createTime(label) {
        const { time } = this.getMethod(label)
        return this.formatStr(this.formatTime(Date.now(), true), time)
    }

    __createSegments(label) {
        const { segments } = this.getMethod(label)

        const result = this.config.segments.map((s, i) => {
            if (i === 0) return this.formatStr(s, segments.first)
            if (i === this.config.segments.length - 1) return this.formatStr(s, segments.last)
            return this.formatStr(s, segments.all)
        })

        const str = result.join(this.formatStr(path.sep, segments.delimiter))

        if (!this.config.config.enableFileLink || !terminalLink.isSupported) return str

        return terminalLink(str, `file://${this.config.filename}`)
    }

    createSegments(label) {
        if (!this.cacheSegments.has(label)) {
            this.cacheSegments.set(label, this.__createSegments(label))
        }

        return this.cacheSegments.get(label)
    }

    createLabel(label) {
        const { label: styleLabel } = this.getMethod(label)

        return this.formatStr(label, styleLabel)
    }

    createStr(label) {
        return [' ', this.createTime(label), this.createSegments(label), this.createLabel(label)]
    }

    logFromMethod(logMethod, label, args) {
        const { show, __space } = this.getMethod(label)
        if (!show) return
        this.groupedEveryTime()

        console[logMethod](...this.createStr(label), __space, ...args)
    }
}

module.exports = NLoggerCore
