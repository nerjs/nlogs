const prettyTime = require('pretty-time')
const merge = require('merge')
const NLoggerCore = require('./loggerCore')

class NLogger extends NLoggerCore {
    constructor(mod, config) {
        super(mod, config)

        this.timeLabels = new Map()
        ;['log', 'info', 'debug', 'warn', 'error', 'time', 'timeEnd', 'dir', 'table'].forEach(m => {
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
        if (this.timeLabels.has(label)) {
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

        this.timeLabels.set(label, Date.now())
    }

    timeEnd(label) {
        const { show, warningMissingLabel, diffTimeColor, label: styleLabel } = this.getMethod(
            'time',
        )
        if (!show) return
        if (!this.timeLabels.has(label)) {
            if (warningMissingLabel) this.warn(`Timer: No such label ${label} for logger.timeEnd()`)
            return
        }

        const time = Date.now() - this.timeLabels.get(label)
        this.timeLabels.delete(label)

        console.log(
            ' ',
            this.createTime('time'),
            this.createSegments('time'),
            this.formatStr(' timeEnd: ', styleLabel),
            `${label}:: `,
            this.formatStr(prettyTime(1000000 * time, 'ms'), diffTimeColor),
        )
    }

    dir(obj, params) {
        const { show, depth } = this.getMethod('dir')
        if (!show) return
        console.group(...this.createStr('dir'))
        console.dir(obj, merge({}, { depth }, params || {}))
        console.groupEnd()
    }

    table(arr) {
        const { show, depth } = this.getMethod('table')
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
