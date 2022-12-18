import { MetaInfo } from './types'

export const IS_META: unique symbol = Symbol('nlogs(is meta)')
export const IS_META_INFO = Symbol('nlogs(is meta info)')

// messages
export const TIME = Symbol('nlogs(message:time)')
export const TIMERANGE = Symbol('nlogs(time range)')
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
export const NO_CONSOLE = Symbol('nlogs(no console)')

export const DEPTH = Symbol('nlogs(depth)')
export const SHOW = Symbol('nlogs(show)')
export const INTERPOLATE = Symbol('nlogs(interpolate)')
export const EMPTY = Symbol('nlogs(empty)')

export const toMetaInfo = (obj: object): MetaInfo => Object.assign({ [IS_META_INFO]: true }, obj)

export const isMetaInfo = (info: any): info is MetaInfo => {
  return (
    typeof info === 'object' &&
    !Object.keys(info).length &&
    Object.getOwnPropertySymbols(info).length &&
    Object.getOwnPropertySymbols(info).every(key => typeof key === 'symbol') &&
    info[IS_META_INFO]
  )
}

export const toMeta = (obj: object): MetaInfo => toMetaInfo({ [IS_META]: true, ...obj })

export const isMeta = (info: any): info is MetaInfo => isMetaInfo(info) && info[IS_META]
