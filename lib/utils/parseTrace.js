const STACK_REGEXP = /at (?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/

module.exports = stack =>
    stack
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
