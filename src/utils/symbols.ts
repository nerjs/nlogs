export const IS_MESSAGE: unique symbol = Symbol('nlogs(is message)')
export const IS_META: unique symbol = Symbol('nlogs(is meta)')
export const IS_DETAILS: unique symbol = Symbol('nlogs(is details)')

// messages
export const TIME = Symbol('nlogs(message:time)')
export const LABEL = Symbol('nlogs(message:label)')
export const HIGHLIGHT = Symbol('nlogs(message:highlight)')
export const STACKTRACE = Symbol('nlogs(message:stacktrace)')

// meta
export const MODULE = Symbol('nlogs(meta:module)')
export const PROJECT = Symbol('nlogs(meta:project)')
export const SERVICE = Symbol('nlogs(meta:service)')
export const CATEGORY = Symbol('nlogs(meta:category)')
export const LEVEL = Symbol('nlogs(meta:level)')
export const TRACE_ID = Symbol('nlogs(meta:traceId)')
export const INDEX = Symbol('nlogs(meta:index)')
export const TIMESTAMP = Symbol('nlogs(meta:timestamp)')

// details
export const DETAILS = Symbol('nlogs(details)')
export const DEPTH = Symbol('nlogs(details:depth)')
export const NO_CONSOLE = Symbol('nlogs(no console)')

export const SHOW = Symbol('nlogs(meta:show)')
