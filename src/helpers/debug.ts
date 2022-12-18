import debug from 'debug'

const debugLog = debug('nlogs')

export const createDebug = (label: string) => debugLog.extend(label)
