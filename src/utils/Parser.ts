import { Details } from '../message/details'
import { ErrorDetails } from '../message/error.details'
import { HighlightMessage } from '../message/highlight.message'
import { Info } from '../message/info'
import { Meta } from '../message/meta'
import { TimeDetails } from '../message/time.details'
import {
  CATEGORY,
  DEPTH,
  DETAILS,
  HIGHLIGHT,
  IS_DETAILS,
  IS_MESSAGE,
  IS_META,
  LABEL,
  LEVEL,
  MODULE,
  NO_CONSOLE,
  PROJECT,
  SERVICE,
  SHOW,
  STACKTRACE,
  TIME,
  TIMESTAMP,
  TRACE_ID,
} from './symbols'

export interface ParserOptions {
  canSingleErrorInDetails: boolean
  canSingleTimeInDetails: boolean
  canSingleTraceInDetails: boolean
}

type MetaInfo = {
  [key: symbol]: any
}

const META_MAPPING: { key: symbol; field: keyof Meta }[] = [
  { key: PROJECT, field: 'project' },
  { key: SERVICE, field: 'service' },
  { key: CATEGORY, field: 'category' },
  { key: LEVEL, field: 'level' },
  { key: TRACE_ID, field: 'traceId' },
  { key: TIMESTAMP, field: 'timestamp' },
  { key: MODULE, field: 'module' },
  { key: SHOW, field: 'show' },
]

export class Parser {
  constructor(private readonly options: ParserOptions, private readonly meta: Meta) {}

  parse(data: any[]): Info {
    const info = new Info(this.meta.clone(), [], new Details(this.options))

    for (const msg of data) this.parseMsg(msg, info)
    return info
  }

  protected parseMsg(msg: any, info: Info) {
    if (typeof msg === 'object') this.parseObject(msg, info)
    else this.parsePrimitives(msg, info)
  }

  protected parseObject(msg: object, info: Info) {
    if (!msg || Array.isArray(msg) || msg instanceof Date) {
      info.messages.push(msg)
    } else if (msg instanceof Error) {
      const error = new ErrorDetails(msg)
      info.details.setError(error)
      this.parsePrimitives(error, info)
    } else if (this.isMetaInfo(msg)) {
      this.parseSymbolsMetaInfo(msg, info)
    } else {
      info.details.assign(msg)
    }
  }

  protected parsePrimitives(value: any, info: Info) {
    info.messages.push(value)
  }

  protected isMetaInfo(info: any): info is MetaInfo {
    return (
      typeof info === 'object' &&
      !Object.keys(info).length &&
      Object.getOwnPropertySymbols(info).length &&
      Object.getOwnPropertySymbols(info).every(key => typeof key === 'symbol')
    )
  }

  protected parseSymbolsMetaInfo(msg: MetaInfo, info: Info) {
    if (msg[IS_META]) return this.parseSymbolsMeta(msg, info)
    else if (msg[IS_MESSAGE]) return this.parseSymbolsMessage(msg, info)
    else if (msg[IS_DETAILS]) return this.parseSymbolsDetails(msg, info)
  }

  protected parseSymbolsMeta(msg: MetaInfo, info: Info) {
    const mp = META_MAPPING.find(({ key }) => msg[key] !== undefined)
    if (mp) info.meta.set(mp.field, msg[mp.key])
    else this.parseSymbolsDetails(msg, info)
  }

  protected parseSymbolsMessage(msg: MetaInfo, info: Info) {
    if (msg[TIME] !== undefined) {
      const time = new TimeDetails(msg[TIME], msg[LABEL])
      info.messages.push(time)
      info.details.setTime(time)
    } else if (msg[HIGHLIGHT]) {
      info.messages.push(new HighlightMessage(msg[HIGHLIGHT]))
    } else if (msg[STACKTRACE]) {
      info.details.setStack(msg[STACKTRACE], msg[LABEL])
    }
  }

  protected parseSymbolsDetails(msg: MetaInfo, info: Info) {
    if (msg[DETAILS]) info.details.assign(msg[DETAILS])
    else if (msg[DEPTH] !== undefined) info.details.setDepth(msg[DEPTH])
    else if (msg[NO_CONSOLE]) info.details.setNoConsole(msg[NO_CONSOLE])
    else info.details.assign(msg)
  }
}
