interface StackObj {
  readonly stack: string
}

const rgx = /(node:)?internal\//

export const STACK_TRACE_LIMIT = 50

export const getStackTrace = (fn?: any) => {
  const originalLimit = Error.stackTraceLimit
  const originalPrepare = Error.prepareStackTrace
  const handleObject: StackObj = { stack: '' }
  Error.stackTraceLimit = STACK_TRACE_LIMIT
  Error.prepareStackTrace = function (_err: any, _cs: any) {
    return handleObject.stack
  }

  try {
    Error.captureStackTrace(handleObject, fn || getStackTrace)
    return handleObject.stack
  } finally {
    Error.stackTraceLimit = originalLimit
    Error.prepareStackTrace = originalPrepare
  }
}

export const filterNotInternalStack = (stack: any[]): string[] => {
  return stack
    .map(s => `${s}`.trim())
    .filter(s => s.startsWith('at') && !rgx.test(s))
    .reduce(
      (acc, cur) => {
        if (cur === acc.last) {
          acc.count++
          acc.stack[acc.stack.length - 1] = `${acc.last} (...x${acc.count})`
        } else {
          acc.stack.push(cur)
          acc.count = 1
        }
        acc.last = cur
        return acc
      },
      { stack: [], last: '', count: 0 },
    ).stack
}

export const stackToArray = (stack: string | string[]) => (Array.isArray(stack) ? stack : `${stack}`.split('\n'))

export const clearStackPath = (str: string): string =>
  str
    .replace(/^(.*)\((.*)\)/, '$2')
    ?.replace(/([:0-9]+)$/, '')
    ?.replace(/^at\s?/, '')

export const getTopStackFile = (fn?: any): string | null => {
  const stack = filterNotInternalStack(stackToArray(getStackTrace(fn)))
  if (!stack.length) return null
  return clearStackPath(stack[0])
}
