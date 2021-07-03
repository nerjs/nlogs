const merge = require('merge')

const Context = require('./Context')
const Message = require('./Message')
const getTrace = require('./utils/getTrace')
const createCounter = require('./utils/createCounter')
const clearMainPath = require('./utils/clearMainPath')

const MANAGER = Symbol('Manager')
const GLOBAL_CONTEXT = Symbol('Global context')

/**
 * @description new Logger('category', module)
 * @typedef {Object} CommonJSModule
 * @property {String} filename
 */

/**
 * @description new Logger('category', import.meta)
 * @typedef {Object} Es6ModuleImportMeta
 * @property {String} url
 */

class Logger {
    /**
     *
     * @param {String|import("./Context")} category
     * @param {CommonJSModule | Es6ModuleImportMeta} [mod]
     * @param {String} [moduleName]
     */
    constructor(category, mod, moduleName = 'main') {
        this.context = this.constructor.createContext(category, mod, moduleName)

        this.timers = new Map()
        this.counters = new Map()

        this.setCurrentFile((mod && (mod.filename || mod.url)) || this.context.filename)

        Logger.bindingMethods.forEach(method => {
            this[method] = this[method].bind(this)
        })
    }

    get manager() {
        return Logger.manager
    }

    _log(level, data) {
        const msg = new Message(this.context, level, data)
        return this.manager.log(msg)
    }

    _hook(name, data) {
        const msg = new Message(this.context, name, data)
        return this.manager.hook(msg)
    }

    log(...args) {
        this._log('log', args)
        return this
    }

    debug(...args) {
        this._log('debug', args)
        return this
    }

    info(...args) {
        this._log('info', args)
        return this
    }

    warn(...args) {
        this._log('warn', args)
        return this
    }

    error(...args) {
        this._log('error', args)
        return this
    }

    trace(msg) {
        const trace = getTrace(Logger.prototype.trace)
        this._log('trace', [trace, msg && `${msg}`])
        return this
    }

    fatal(...args) {
        const code = typeof args[0] === 'number' ? args.shift() : 1
        this._log('fatal', args)
        this._hook('fatal', [code, ...args])
        return this
    }

    table(...args) {
        this._log('table', args)
        return this
    }

    dir(...args) {
        const msg = new Message(this.context, 'dir', args)
        if (typeof msg.data[msg.data.length - 1] === 'number') {
            msg.depth = msg.data.pop()
        }
        this.manager.log(msg)
        return this
    }

    time(name, msg) {
        if (!name) return this.warn('timer name is required argument. Logger.time()')
        if (this.timers.has(name)) return this.warn(`timer ${name} already exists. Logger.time()`)

        const timer = Logger.createTimer(this, name)
        this.timers.set(name, timer)
        this._hook('time', [name, timer.startTime, msg])
        return timer
    }

    timeLog(name, msg) {
        if (!name) return this.warn('timer name is required argument. Logger.timeLog()')
        if (!this.timers.has(name))
            return this.warn(`timer ${name} doesn't exist yet. Logger.timeLog()`)

        const timeDelta = Date.now() - this.timers.get(name).startTime
        this._log('timeLog', [name, timeDelta, msg])

        return this
    }

    timeEnd(name, msg) {
        if (!name) return this.warn('timer name is required argument. Logger.timeEnd()')
        if (!this.timers.has(name))
            return this.warn(`timer ${name} doesn't exist yet. Logger.timeEnd()`)

        const timer = this.timers.get(name)
        this.timers.delete(name)
        const timeDelta = Date.now() - timer.startTime

        this._log('timeEnd', [name, timeDelta, msg])
        this._hook('timeEnd', [name, timeDelta, timer.startTime, msg])
        return this
    }

    count(name, msg) {
        if (!name) return this.warn('counter name is required argument. Logger.count()')
        const counter = this.counters.get(name) || createCounter()
        this.counters.set(name, counter)
        this._log('count', [name, counter(), msg])
        return this
    }

    resetCount(name) {
        if (!name) return this.warn('counter name is required argument. Logger.resetCount()')
        this.counters.delete(name)
        this._hook('resetCount', [name])
        return this
    }

    group(name) {
        this._hook('group', [name])
        this.context.setGroup(name)
        return this
    }

    groupEnd(name) {
        this._hook('groupEnd', [name])
        this.context.removeGroup(name)
        return this
    }

    traceId(nTraceId) {
        this.context.traceId = nTraceId || null
        this._hook('traceId', [nTraceId])
        return this
    }

    clone() {
        const ctx = this.context.clone()
        const { manager } = this
        return new Logger(ctx, { manager })
    }

    /**
     *
     * @param {Logger} logger
     * @returns {Logger}
     */
    from(logger) {
        const { category, filename } = this.context
        const ctx = logger.context.clone()
        ctx.category = category
        return new Logger(ctx, { filename })
    }

    /**
     *
     * @param {String} [mod]
     */
    setCurrentFile(mod) {
        const filename =
            mod && typeof mod === 'string' && mod.length
                ? mod
                : (() => {
                      const trace = getTrace(Logger)
                      return trace && trace.length ? trace[0].file : null
                  })()

        this.context.setFilename(filename && clearMainPath(filename))
    }

    static get bindingMethods() {
        return [
            'log',
            'info',
            'debug',
            'warn',
            'trace',
            'error',
            'fatal',
            'table',
            'dir',
            'time',
            'timeLog',
            'timeEnd',
            'count',
            'resetCount',
        ]
    }

    static createTimer(logger, name) {
        const startTime = Date.now()

        const endTimer = msg => logger.timeEnd(name, msg)
        endTimer.startTime = startTime
        endTimer.log = msg => logger.timeLog(name, msg)
        endTimer.end = endTimer

        return endTimer
    }

    /**
     * @returns {import("./Manager")}
     */
    static get manager() {
        if (!this[MANAGER]) throw new Error('Logger manager is not defined')
        return this[MANAGER]
    }

    /**
     * @param {import("./Manager")} manager
     */
    static setManager(manager) {
        const prevManager = this[MANAGER]
        this[MANAGER] = manager

        return Promise.resolve(prevManager && prevManager.stop())
    }

    static get globalContext() {
        return this[GLOBAL_CONTEXT] || {}
    }

    static setGlobalContext(ctx) {
        this[GLOBAL_CONTEXT] = merge(true, Logger.globalContext, this.globalContext, ctx)
    }

    /**
     *
     * @param {String|import("./Context")} context
     * @param {String|CommonJSModule|Es6ModuleImportMeta} mod
     * @param {String} moduleName
     * @returns {import("./Context")}
     */
    static createContext(context, mod, moduleName) {
        if (typeof context === 'string')
            return this.createContext(
                new Context({ ...this.globalContext, category: context }),
                mod,
                moduleName,
            )
        if (typeof context === 'object' && !(context instanceof Context))
            return this.createContext(
                new Context({ ...this.globalContext, ...context }),
                mod,
                moduleName,
            )

        if (!(context instanceof Context)) throw new Error('Incorrect context arguments')

        if (mod) {
            if (typeof mod === 'string') return this.createContext(context, { filename: mod })
            context.setFilename(mod.filename || mod.url)
        }

        if (moduleName) context.module = moduleName

        return context
    }
}

module.exports = Logger
