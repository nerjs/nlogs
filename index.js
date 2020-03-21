const Logger = require('./lib/logger')
const Settings = require('./lib/config')

exports = module.exports = (mod, category, settings) => new Logger(mod, category, settings)

exports.getSettings = () => Settings.config

exports.setSettings = newSettings => Settings.setConfig(newSettings)
