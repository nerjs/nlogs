import { Details } from '../message/details'
import { ErrorDetails } from '../message/error.details'
import { HighlightMessage } from '../message/highlight.message'
import { Meta } from '../message/meta'
import { TimeDetails } from '../message/time.details'
import {
  CATEGORY,
  DEPTH,
  DETAILS,
  HIGHLIGHT,
  INDEX,
  INTERPOLATE,
  isMetaInfo,
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
} from '../helpers/symbols'
import { MessageInfo } from '../message/message.info'
import { MetaInfo } from '../helpers/types'

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
  { key: SHOW, field: 'show' },
]

export class Parser {
  constructor(private readonly options: ParserOptions, private readonly meta: Meta) {}

  parse(data: any[]): MessageInfo {
    const info = new MessageInfo(this.meta.clone(), new Details(this.options))

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
    if (msg[IS_META]) return this.parseSymbolsMeta(msg, info)
    // else if (msg[IS_MESSAGE]) return this.parseSymbolsMessage(msg, info)
    // else if (msg[IS_DETAILS]) return this.parseSymbolsDetails(msg, info)
  }

  protected parseSymbolsMeta(msg: MetaInfo, info: MessageInfo) {
    const mp = META_MAPPING.find(({ key }) => msg[key] !== undefined)
    if (mp) info.meta.set(mp.field, msg[mp.key])

    if (msg[INTERPOLATE] && Array.isArray(msg[INTERPOLATE])) {
      for (const imsg of msg[INTERPOLATE]) this.parseMsg(imsg, info)
    }
  }

  protected parseSymbolsMessage(msg: MetaInfo, info: MessageInfo) {
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

  protected parseSymbolsDetails(msg: MetaInfo, info: MessageInfo) {
    if (msg[DETAILS]) info.details.assign(msg[DETAILS])
    else if (msg[DEPTH] !== undefined) info.details.setDepth(msg[DEPTH])
    else if (msg[NO_CONSOLE]) info.details.setNoConsole(msg[NO_CONSOLE])
  }
}
