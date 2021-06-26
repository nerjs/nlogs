const parseTrace = require('./parseTrace')

const getTrace = fn => {
    const originalLimit = Error.stackTraceLimit
    const originalPrepare = Error.prepareStackTrace
    const handleObject = {}
    Error.stackTraceLimit = Infinity
    Error.prepareStackTrace = function(err, cs) {
        return handleObject
    }

    Error.captureStackTrace(handleObject, fn || getTrace)

    Error.stackTraceLimit = originalLimit
    Error.prepareStackTrace = originalPrepare

    return parseTrace(handleObject.stack)
}

module.exports = getTrace
