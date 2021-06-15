const prettyTime = require('pretty-time')
const merge = require('merge')
const NLoggerCore = require('./loggerCore')
const { TIME_LABELS_MAP } = require('./constants')

class NLogger extends NLoggerCore {
    constructor(mod, config) {
        super(mod, config)

        this[TIME_LABELS_MAP] = new Map()
        ;[
            'log',
            'info',
            'debug',
            'warn',
            'error',
            'time',
            'timeLog',
            'timeEnd',
            'dir',
            'table',
        ].forEach(m => {
            this[m] = this[m].bind(this)
        })
    }

    log(...args) {
        this.logFromMethod('log', 'log', args)
    }

    info(...args) {
        this.logFromMethod('info', 'info', args)
    }

    debug(...args) {
        this.logFromMethod('log', 'debug', args)
    }

    warn(...args) {
        this.logFromMethod('error', 'warn', args)
    }

    error(...args) {
        this.logFromMethod('error', 'error', args)
    }

    time(label) {
        const {
            show,
            showStartTimer,
            warningPresentLabel,
            changePresentLabel,
            label: styleLabel,
        } = this.getMethod('time')
        if (!show) return
        if (this[TIME_LABELS_MAP].has(label)) {
            if (warningPresentLabel)
                this.warn(`Timer: Label ${label} already exists for logger.time()`)
            if (!changePresentLabel) return
        }

        if (showStartTimer)
            console.log(
                ' ',
                this.createTime('time'),
                this.createSegments('time'),
                this.formatStr('timeStart:', styleLabel),
                label,
            )

        this[TIME_LABELS_MAP].set(label, Date.now())

        const timeEnd = () => this.timeEnd(label)
        timeEnd.log = () => this.timeLog(label)

        return timeEnd
    }

    __timeLog(label, txt) {
        const { show, warningMissingLabel, diffTimeColor, label: styleLabel } = this.getMethod(
            'time',
        )
        if (!show) return
        if (!this[TIME_LABELS_MAP].has(label)) {
            if (warningMissingLabel)
                this.warn(`Timer: No such label ${label} for logger.${`${txt}`.trim()}()`)
            return
        }

        const time = Date.now() - this[TIME_LABELS_MAP].get(label)

        console.log(
            ' ',
            this.createTime('time'),
            this.createSegments('time'),
            this.formatStr(txt, styleLabel),
            `${label}:: `,
            this.formatStr(prettyTime(1000000 * time, 'ms'), diffTimeColor),
        )

        return true
    }

    timeLog(label) {
        this.__timeLog(label, ' timeLog: ')
    }

    timeEnd(label) {
        const res = this.__timeLog(label, ' timeEnd: ')
        if (res) this[TIME_LABELS_MAP].delete(label)
    }

    dir(obj, params) {
        const { show, depth } = this.getMethod('dir')
        if (!show) return
        console.group(...this.createStr('dir'))
        console.dir(obj, merge({}, { depth }, params || {}))
        console.groupEnd()
    }

    table(arr) {
        const { show } = this.getMethod('table')
        if (!show) return
        console.group(...this.createStr('table'))
        console.table(arr)
        console.groupEnd()
    }

    clear() {
        console.clear()
    }
}

module.exports = NLogger
