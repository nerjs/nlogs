import {
  CATEGORY,
  DEPTH,
  DETAILS,
  EMPTY,
  HIDDEN_DETAILS,
  HIGHLIGHT,
  INDEX,
  INTERPOLATE,
  isMetaInfo,
  IS_META_INFO,
  LEVEL,
  META_VALUE,
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
import { TimeRange } from '../message/time.range'
import { MetaInfo } from '../helpers/types'
import { Meta } from '../message/meta'
import { TimeDetails } from '../message/time.details'
import { IFormatter } from './types'
import { ModDetails } from '../message/mod.details'
import { stackToArray } from '../helpers/stack'
import { ErrorDetails } from '../message/error.details'
import { LogInfo } from '../message/log.info'

export class LogReader {
  constructor(private readonly formatter: IFormatter) {}

  read(meta: Meta, data: any[]) {
    const info = new LogInfo(meta.clone())

    for (const msg of data) {
      if (msg == null) info.push(this.formatter.null(msg, info))
      else if (typeof msg === 'symbol') info.push(this.formatter.symbol(msg, info))
      else if (typeof msg === 'bigint') info.push(this.formatter.bigint(msg, info))
      else if (isMetaInfo(msg)) this.metaInfo(msg, info)
      else if (msg instanceof Error) this.setError(info, new ErrorDetails(msg))
      else if (msg instanceof Date) info.push(this.formatter.date(msg, info))
      else if (Array.isArray(msg)) info.push(this.formatter.array(msg, info))
      else if (msg && typeof msg === 'object') info.details.assign(msg)
      else if (typeof msg === 'string' && !msg) continue
      else info.push(msg)
    }

    for (const idx of info.entities.time)
      info.messages[idx] = this.formatter.time(info.messages[idx].pretty, info.messages[idx].label || null, info)
    for (const idx of info.entities.error)
      info.messages[idx] = this.formatter.error(info.messages[idx].name, info.messages[idx].message, info)
    for (const idx of info.entities.highlight) info.messages[idx] = this.formatter.highlight(info.messages[idx], info)

    info.message = this.formatter.messages(info.messages, info)

    return info
  }

  private metaInfo(msg: MetaInfo, info: LogInfo) {
    switch (msg[IS_META_INFO]) {
      case EMPTY:
        return
      case INTERPOLATE:
        return (msg[META_VALUE] || []).forEach(val => this.metaInfo(val, info))
      case SHOW:
        info.show = msg[META_VALUE] === undefined || !!msg[META_VALUE]
        break
      case DEPTH:
        info.details.setDepth(msg[META_VALUE])
        break

      case HIDDEN_DETAILS:
      case NO_CONSOLE:
        info.details.hiddenAssign(msg[META_VALUE])
        break

      case DETAILS:
        info.details.assign(msg[META_VALUE])
        break

      case PROJECT:
        info.meta.set('project', msg[META_VALUE])
        break
      case SERVICE:
        info.meta.set('service', msg[META_VALUE])
        break
      case CATEGORY:
        info.meta.set('category', msg[META_VALUE])
        break
      case LEVEL:
        info.meta.set('level', msg[META_VALUE])
        break
      case TRACE_ID:
        info.meta.set('traceId', msg[META_VALUE])
        break
      case INDEX:
        info.index = msg[META_VALUE]
        break
      case TIMESTAMP:
        info.meta.set('timestamp', msg[META_VALUE])
        break

      case MODULE:
        return this.setModule(info, msg[META_VALUE])

      case TIME:
        return this.setTime(info, msg[META_VALUE])
      case TIMERANGE:
        return this.setTimeRange(info, msg[META_VALUE])
      case HIGHLIGHT:
        return this.setHighlight(info, msg[META_VALUE])
      case STACKTRACE:
        return this.setStacktrace(info, msg[META_VALUE])
    }
  }

  private setTime(info: LogInfo, value: any) {
    if (value instanceof TimeDetails) {
      info.details.setTime(value)
      info.entity('time', value)
    }
  }

  private setTimeRange(info: LogInfo, value: any) {
    if (value instanceof TimeRange) {
      info.details.setTimeRange(value)
      info.entity('time', value)
    }
  }

  private setModule(info: LogInfo, value: any) {
    if (value instanceof ModDetails) info.details.setModule(value)
  }

  private setHighlight(info: LogInfo, value: any) {
    if (typeof value === 'string' && value.length) info.entity('highlight', value)
  }

  private setStacktrace(info: LogInfo, value: any) {
    if (typeof value === 'string') return this.setStacktrace(info, { stack: stackToArray(value) })
    if (Array.isArray(value)) return this.setStacktrace(info, { stack: value })
    if (typeof value !== 'object' || !value.stack) return
    if (
      !value.label &&
      value.stack[0] &&
      value.stack.length > 1 &&
      typeof value.stack[0] === 'string' &&
      !value.stack[0].startsWith('at')
    ) {
      value.label = value.stack.shift()
    }

    info.details.setStacktrace(value.stack, value.label)
  }

  private setError(info: LogInfo, value: any) {
    if (value instanceof ErrorDetails) {
      info.details.setError(value)
      info.entity('error', value)
    }
  }
}
