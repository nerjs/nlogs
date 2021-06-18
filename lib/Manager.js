const isBrowser = require('./utils/isBrowser')

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

    getHandler(map, label) {
        if (map.has(label)) return map.get(label)

        const handlers = this.transports
            .filter(transport => transport.includes(label))
            .map(transport => transport.bind(transport))

        const handler = async msg => {
            for (let h of handlers) {
                await h(msg)
            }
        }

        map.set(label, handler)
        return handler
    }

    addPromise(promise) {
        this.waitPromise = this.waitPromise.finally(() => promise).catch(e => console.error(e))
    }

    /**
     * @param {import('./Message')} msg
     */
    log(msg) {
        const handler = this.getHandler(this.labels, msg.label)
        this.addPromise(handler(msg))
    }

    /**
     * @param {import('./Message')} msg
     */
    async hook(msg) {
        const handler = this.getHandler(this.hooks, msg.label)
        const promise = handler(msg)
        this.addPromise(promise)
        await promise
    }

    /**
     *
     * @param {Number} code
     */
    async exit(code) {
        if (isBrowser()) {
            console.error(new Error(`Exit with code ${code}`))
        } else {
            await this.wait
            process.exit(code)
        }
    }
}

module.exports = Manager
