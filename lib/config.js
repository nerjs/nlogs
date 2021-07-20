const merge = require('merge')
const Manager = require('./Manager')

const getTransports = trName => {
    switch (trName) {
        case 'console':
            return require('./transports/ConsoleTransport')
        case 'http':
            return require('./transports/HttpTransport')
        default:
            return null
    }
}

/**
 *
 * @param {import("./BaseLogger")} Logger
 * @param {Settings} settings
 */
module.exports = (Logger, settings) => {
    const { context, ...trs } = merge.recursive(
        true,
        {
            context: {
                mode: process.env.NODE_ENV || 'development',
            },
        },
        settings,
    )

    const newManager = new Manager()
    const mPromise = Logger.setManager(newManager)
    Logger.setGlobalContext(context || {})

    Object.entries(trs).forEach(([key, { include, exclude, ...options }]) => {
        const Tr = getTransports(key)
        if (!Tr) return

        const tr = new Tr(options)

        if (include && !Array.isArray(include)) {
            tr.includeAll()
        } else if (exclude && !Array.isArray(exclude)) {
            tr.excludeAll()
        } else {
            if (include) tr.include(include)
            if (exclude) tr.include(exclude)
        }
        newManager.add(tr)
    })

    if (!newManager.transports.size) {
        const CTr = getTransports('console')
        const ctr = new CTr({})
        ctr.includeAll()
        newManager.add(ctr)
    }

    ;(async () => {
        try {
            await mPromise
        } catch (err) {
            console.error(err)
        }
        await newManager.init()
    })().catch(console.error)
}

/**
 * @typedef {Object} SettingsMixin
 * @property {Boolean|String[]} [include]
 * @property {Boolean|String[]} [exclude]
 */

/**
 * @typedef {Object} Settings
 * @property {Object} [context]
 * @property {SettingsMixin|import("./transports/ConsoleTransport").ConsoleTransportConfig} [console]
 * @property {SettingsMixin|import("./transports/HttpTransport").HttpTransportConfig} [http]
 * @property {SettingsMixin|import("./transports/StreamTransport").StreamTransportOptions} [stream]
 * @property {SettingsMixin|import("./transports/FileTransport").FileTransportOptions} [file]
 * @property {SettingsMixin|import("./transports/TcpTransport").TcpTransportOptions} [tcp]
 */
