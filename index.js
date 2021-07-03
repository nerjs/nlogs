const Logger = require('./lib/Logger')
const Manager = require('./lib/Manager')
const Transport = require('./lib/Transport')
const config = require('./lib/config')

exports = module.exports = Logger

exports.config = config
exports.Logger = Logger
exports.Manager = Manager
exports.Transport = Transport

config({
    console: {
        include: true,
    },
})
