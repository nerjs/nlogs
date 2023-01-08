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
import { Details } from '../message/details'
import { Meta } from '../message/meta'
import { TimeDetails } from '../message/time.details'
import { IFormatter } from './types'
import { ModDetails } from '../message/mod.details'
import { stackToArray } from '../helpers/stack'
import { ErrorDetails } from '../message/error.details'

export class LogReader {
  constructor(private readonly meta: Meta, private readonly formatter: IFormatter) {}

  read(...data: any[]) {
    return this.parse(data)
  }

  parse(data: any[]) {
    const meta = this.meta.clone()
    const details = new Details()
    const messages: any[] = []

    for (const msg of data) {
      if (msg == null) messages.push(this.formatter.null(msg))
      else if (typeof msg === 'symbol') messages.push(this.formatter.symbol(msg))
      else if (typeof msg === 'bigint') messages.push(this.formatter.bigint(msg))
      else if (isMetaInfo(msg)) this.metaInfo(msg, messages, meta, details)
      else if (msg instanceof Error) this.setError(details, messages, new ErrorDetails(msg))
      else if (msg instanceof Date) messages.push(this.formatter.date(msg))
      else if (Array.isArray(msg)) messages.push(this.formatter.array(msg))
      else if (msg && typeof msg === 'object') details.assign(msg)
      else messages.push(msg)
    }

    const message = this.formatter.messages(messages)
    return this.formatter.format(meta, details, message)
  }

  private metaInfo(msg: MetaInfo, messages: any[], meta: Meta, details: Details) {
    switch (msg[IS_META_INFO]) {
      case EMPTY:
        return
      case INTERPOLATE:
        return (msg[META_VALUE] || []).forEach(val => this.metaInfo(val, messages, meta, details))
      case SHOW:
        meta.set('show', msg[META_VALUE] === undefined || !!msg[META_VALUE])
        break
      case DEPTH:
        details.setDepth(msg[META_VALUE])
        break

      case HIDDEN_DETAILS:
      case NO_CONSOLE:
        details.hiddenAssign(msg[META_VALUE])
        break

      case DETAILS:
        details.assign(msg[META_VALUE])
        break

      case PROJECT:
        meta.set('project', msg[META_VALUE])
        break
      case SERVICE:
        meta.set('service', msg[META_VALUE])
        break
      case CATEGORY:
        meta.set('category', msg[META_VALUE])
        break
      case LEVEL:
        meta.set('level', msg[META_VALUE])
        break
      case TRACE_ID:
        meta.set('traceId', msg[META_VALUE])
        break
      case INDEX:
        meta.set('index', msg[META_VALUE])
        break
      case TIMESTAMP:
        meta.set('timestamp', msg[META_VALUE])
        break

      case MODULE:
        return this.setModule(details, msg[META_VALUE])

      case TIME:
        return this.setTime(details, messages, msg[META_VALUE])
      case TIMERANGE:
        return this.setTimeRange(details, messages, msg[META_VALUE])
      case HIGHLIGHT:
        return this.setHighlight(messages, msg[META_VALUE])
      case STACKTRACE:
        return this.setStacktrace(details, msg[META_VALUE])
    }
  }

  private setTime(details: Details, messages: any[], value: any) {
    if (value instanceof TimeDetails) {
      details.setTime(value)
      const str = this.formatter.time(value.pretty, value.label)
      messages.push(str)
    }
  }

  private setTimeRange(details: Details, messages: any[], value: any) {
    if (value instanceof TimeRange) {
      details.setTimeRange(value)
      const str = this.formatter.time(value.delta.pretty, value.delta.label)
      messages.push(str)
    }
  }

  private setModule(details: Details, value: any) {
    if (value instanceof ModDetails) details.setModule(value)
  }

  private setHighlight(messages: any[], value: any) {
    if (typeof value === 'string' && value.length) {
      const str = this.formatter.highlight(value)
      messages.push(str)
    }
  }

  private setStacktrace(details: Details, value: any) {
    if (typeof value === 'string') return this.setStacktrace(details, { stack: stackToArray(value) })
    if (Array.isArray(value)) return this.setStacktrace(details, { stack: value })
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

    details.setStacktrace(value.stack, value.label)
  }

  private setError(details: Details, messages: any[], value: any) {
    if (value instanceof ErrorDetails) {
      details.setError(value)
      const str = this.formatter.error(value.name, value.message)
      messages.push(str)
    }
  }
}
