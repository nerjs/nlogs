const NLogger = require('./lib/logger')
const Settings = require('./lib/config')

const Logger = (mod, settings) => new NLogger(mod, settings)

exports = module.exports = Logger

exports.Logger = NLogger

exports.getConfig = () => Settings.config

exports.setConfig = newConfig => Settings.setConfig(newConfig)
