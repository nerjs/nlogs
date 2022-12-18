interface StackObj {
  readonly stack: string
}

const rgx = /(node:)?internal\//

export const getStackTrace = (fn?: any) => {
  const originalLimit = Error.stackTraceLimit
  const originalPrepare = Error.prepareStackTrace
  const handleObject: StackObj = { stack: '' }
  Error.stackTraceLimit = Infinity
  Error.prepareStackTrace = function (_err: any, _cs: any) {
    return handleObject
  }

  Error.captureStackTrace(handleObject, fn || getStackTrace)

  Error.stackTraceLimit = originalLimit
  Error.prepareStackTrace = originalPrepare
  return handleObject.stack
}

export const filterNotInternalStack = (stack: any[]): string[] => {
  const arr = stack.map(s => `${s}`.trim()).filter(s => s.startsWith('at') && !rgx.test(s))
  if (!arr.length) return []
  return arr.filter(s => s && s.startsWith('at'))
}

export const stackToArray = (stack: string | string[]) => (Array.isArray(stack) ? stack : `${stack}`.split('\n'))

export const getTopPath = (str: string): string => str.replace(/^(.*)\((.*)\)/, '$2')?.replace(/([:0-9]+)$/, '')

export const getTopStackFile = (fn?: any): string | null => {
  const stack = filterNotInternalStack(stackToArray(getStackTrace(fn)))
  if (!stack.length) return null
  return getTopPath(stack[0])
}
