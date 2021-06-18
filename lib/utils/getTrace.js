const STACK_REGEXP = /at (?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/

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

    return handleObject.stack
        .split('\n')
        .map(s => `${s}`.trim().match(STACK_REGEXP))
        .filter(s => !!s && !!s[2] && !s[2].includes('internal/'))
        .map(([origin, func, file, line, column]) => ({
            func,
            file,
            line: +line,
            column: +column,
            origin,
        }))
}

module.exports = getTrace
