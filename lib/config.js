const merge = require('merge')
const Logger = require('./Logger')
const Manager = require('./Manager')

Logger.setManager(new Manager())
const logger = new Logger('config', module, 'nlogs')

const getTransports = trName => {
    switch (trName) {
        case 'console':
            return require('./transports/ConsoleTransport')
        default:
            return null
    }
}

module.exports = obj => {
    const { context, ...trs } = merge.recursive(true, obj)
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
            logger.error(err)
        }
        await newManager.init()
    })().catch(logger.error)
}
