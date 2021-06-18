const createCounter = require('./createCounter')

const counter = createCounter()

module.exports = () =>
    `${Date.now().toString(36)}.${counter().toString(36)}.${Math.random()
        .toString(36)
        .substr(2)}`
