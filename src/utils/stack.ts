interface StackObj {
  readonly stack: string
}

const rgx = /(node:)?internal\//

export const parseStackArr = (stack: any[]) => {
  const arr = stack.map(s => `${s}`.trim()).filter(s => !rgx.test(s))
  if (!arr.length) return ['unknown']
  return arr.filter(s => s && s.startsWith('at'))
}

export const parseStackString = (stack: any) => parseStackArr(`${stack}`.split('\n'))

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

  return parseStackString(handleObject.stack)
}
