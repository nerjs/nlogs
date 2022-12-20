import { Details } from '../message/details'
import { ErrorDetails } from '../message/error.details'
import { HighlightMessage } from '../message/highlight.message'
import { Meta } from '../message/meta'
import { TimeDetails } from '../message/time.details'
import {
  CATEGORY,
  DEPTH,
  DETAILS,
  EMPTY,
  HIGHLIGHT,
  INDEX,
  INTERPOLATE,
  isMeta,
  isMetaInfo,
  LEVEL,
  MODULE,
  NO_CONSOLE,
  PROJECT,
  SERVICE,
  SHOW,
  STACKTRACE,
  TIME,
  TIMERANGE,
  TIMESTAMP,
  TRACE_ID,
} from '../helpers/symbols'
import { MessageInfo } from '../message/message.info'
import { MetaInfo } from '../helpers/types'
import { TimeRange } from '../message/time.range'
import { createDebug } from '../helpers/debug'
import { Mod } from '../helpers/mod'

const debug = createDebug('parser')

export interface ParserOptions {
  canSingleErrorInDetails: boolean
  canSingleTimeInDetails: boolean
  canSingleTraceInDetails: boolean
}

const META_MAPPING: { key: symbol; field: keyof Meta }[] = [
  { key: PROJECT, field: 'project' },
  { key: SERVICE, field: 'service' },
  { key: CATEGORY, field: 'category' },
  { key: LEVEL, field: 'level' },
  { key: TRACE_ID, field: 'traceId' },
  { key: TIMESTAMP, field: 'timestamp' },
  { key: MODULE, field: 'module' },
  { key: INDEX, field: 'index' },
]

export class Parser {
  constructor(private readonly options: ParserOptions, private readonly meta: Meta) {}

  parse(data: any[], mod: Mod): MessageInfo {
    debug('parse message')
    const info = new MessageInfo(this.meta.clone(), new Details(this.options), mod)
    for (const msg of data) this.parseMsg(msg, info)
    return info
  }

  protected parseMsg(msg: any, info: MessageInfo) {
    if (typeof msg === 'object') this.parseObject(msg, info)
    else this.parsePrimitives(msg, info)
  }

  protected parseObject(msg: object, info: MessageInfo) {
    if (!msg || Array.isArray(msg) || msg instanceof Date) {
      info.messages.push(msg)
    } else if (msg instanceof Error) {
      const error = new ErrorDetails(msg)
      info.details.setError(error)
      this.parsePrimitives(error, info)
    } else if (isMetaInfo(msg)) {
      this.parseSymbolsMetaInfo(msg, info)
    } else {
      info.details.assign(msg)
    }
  }

  protected parsePrimitives(value: any, info: MessageInfo) {
    info.messages.push(value)
  }

  protected parseSymbolsMetaInfo(msg: MetaInfo, info: MessageInfo) {
    if (isMeta(msg)) return this.parseSymbolsMeta(msg, info)
    this.parseOtherSymbols(msg, info)
  }

  protected parseSymbolsMeta(msg: MetaInfo, info: MessageInfo) {
    const mp = META_MAPPING.find(({ key }) => msg[key] !== undefined)
    if (mp) info.meta.set(mp.field, msg[mp.key])
  }

  protected parseOtherSymbols(msg: MetaInfo, info: MessageInfo) {
    if (msg[TIME]) {
      const time = new TimeDetails(msg[TIME]?.ms, msg[TIME]?.label)
      info.push(time)
      info.details.setTime(time)
    } else if (msg[HIGHLIGHT]) {
      info.push(new HighlightMessage(msg[HIGHLIGHT]))
    } else if (msg[STACKTRACE]) {
      info.details.setStack(msg[STACKTRACE]?.stack, msg[STACKTRACE]?.label)
    } else if (msg[DETAILS]) {
      info.details.assign(msg[DETAILS])
    } else if (msg[DEPTH] !== undefined) {
      info.details.setDepth(msg[DEPTH])
    } else if (msg[NO_CONSOLE]) {
      info.details.setNoConsole(msg[NO_CONSOLE])
    } else if (msg[TIMERANGE]) {
      const range = new TimeRange(msg[TIMERANGE]?.from, msg[TIMERANGE]?.to, msg[TIMERANGE]?.label)
      info.details.setTimeRange(range)
      info.push(range.delta)
    } else if (msg[INTERPOLATE]) {
      if (Array.isArray(msg[INTERPOLATE])) {
        msg[INTERPOLATE].forEach(val => this.parseMsg(val, info))
      }
    } else if (msg[SHOW] !== undefined) {
      info.setShow(!!msg[SHOW])
    } else if (msg[EMPTY]) {
      return
    }
  }
}
