const ErrorMessage = require('./ErrorMessage')

/**
 * @class
 * @name Manager
 */
class Manager {
    constructor() {
        this.transports = new Set()
        this.labels = new Map()
        this.hooks = new Map()

        this.waitPromise = Promise.resolve()
    }

    get wait() {
        return Promise.resolve(this.waitPromise)
    }

    async init() {
        this.labels.clear()
        this.hooks.clear()
        for (let transport of this.transports) {
            await transport.init()
        }
    }

    async stop() {
        await this.wait
        for (let transport of this.transports) {
            await transport.stop()
        }
        this.clear()
    }

    add(transport) {
        this.transports.add(transport)
        this.labels.clear()
        this.hooks.clear()
        return this
    }

    delete(transport) {
        this.transports.delete(transport)
        this.labels.clear()
        this.hooks.clear()
        return this
    }

    clear() {
        this.transports.clear()
        this.labels.clear()
        this.hooks.clear()
        return this
    }

    getHandler(map, fn, label) {
        if (map.has(label)) return map.get(label)

        const handlers = [...this.transports]
            .filter(transport => transport.includes(label))
            .map(transport => ({ name: transport.name, fn: transport[fn].bind(transport) }))

        const handler = async msg => {
            for (let h of handlers) {
                try {
                    await h.fn(msg)
                } catch (e) {
                    await this.onError(e, msg, h.name)
                }
            }
        }

        handler.handlers = handlers

        map.set(label, handler)
        return handler
    }

    async onError(err, _msg, transportName) {
        const msg = new ErrorMessage(err, _msg, transportName)
        msg.addFailedErrorTransport('test transport')
        const { handlers } = this.getHandler(this.labels, 'log', 'error')

        let sended = false
        for (let h of handlers) {
            try {
                await h.fn(msg)
                sended = true
            } catch (e) {
                msg.addFailedErrorTransport(h.name)
                msg.data.push(e)
            }
        }
        if (!sended) console.error(msg.message, msg.details)
    }

    addPromise(promise) {
        this.waitPromise = this.waitPromise.finally(() => promise).catch(e => console.error(e))
    }

    /**
     * @param {import('./Message')} msg
     */
    log(msg) {
        const handler = this.getHandler(this.labels, 'log', msg.label)
        this.addPromise(handler(msg))
    }

    /**
     * @param {import('./Message')} msg
     */
    async hook(msg) {
        const handler = this.getHandler(this.hooks, 'hook', msg.label)
        const promise = handler(msg)
        this.addPromise(promise)
        await promise
    }

    /**
     *
     * @param {Number} code
     */
    async exit(code) {
        await this.wait
        process.exit(code)
    }
}

module.exports = Manager
