import EventEmitter from 'events'
import prettyTime from 'pretty-time'
import { DEFAULT_PROJECT } from '../config/constants'
import type { TransportConfig } from '../config/types'
import { objectToString } from '../helpers/string'
import { Base } from './Base'
import { ProxyError } from './errors'
import { Parser } from './Parser'
import { DATETIME, HIGHLIGHT, STACKTRACE, TIME } from './symbols'
import { MaybePromise } from './types'

export abstract class Transport<C> extends EventEmitter {
  constructor(readonly config: TransportConfig<C>) {
    super()
  }

  abstract logTo(parser: Parser): MaybePromise<boolean>
  abstract count(): number

  get allowed() {
    return this.config.allowed
  }

  async log(parser: Parser): Promise<boolean> {
    if (!this.config.allowed) return false
    if (parser.meta.level === 'debug') {
      const { allowed, only, categories, modules } = this.config.debug
      if (!allowed) return false
      if (only) {
        if (modules.length && parser.meta.module && !modules.includes(parser.meta.module)) return false
        if (categories.length && !categories.includes(parser.meta.category)) return false
      }
    }
    return this.wrapLogTo(parser)
  }

  protected init() {}

  #inited = false
  private async wrapLogTo(parser) {
    try {
      if (!this.#inited) {
        await this.init()
        this.#inited = true
      }
      return await this.logTo(parser)
    } catch (err) {
      const error = ProxyError.from(err)
      this.emit('error', error, parser)
      return false
    }
  }

  static toJsonLine(parser: Parser, addTraceId?: boolean): string {
    const message = this.toTextMessages(parser.messages)
    const { level, timestamp, traceId, ...meta } = parser.meta

    return JSON.stringify({
      timestamp: parser.timestamp,
      level: parser.level,
      message,
      meta,
      details: parser.details,
      traceId: addTraceId && traceId ? traceId : undefined,
    })
  }

  static toTextLine(parser: Parser, addTraceId?: boolean): string {
    const message = this.toTextMessages(parser.messages)
    const timestamp = this.toTextDateTime(parser.timestamp)
    const meta = objectToString(
      Object.assign(
        {},
        parser.meta.project !== DEFAULT_PROJECT && { project: parser.meta.project },
        parser.meta.module && { module: parser.meta.module },
        {
          service: parser.meta.service,
          category: parser.meta.category,
        },
      ),
    )

    const row = [timestamp, `[ ${meta} ]`, `[${parser.level.toUpperCase()}]`]
    if (message.length) row.push(objectToString({ message }))
    if (parser.details) row.push(`details=${JSON.stringify(parser.details)}`)
    if (addTraceId && parser.meta.traceId) row.push(`traceId=${parser.meta.traceId}`)

    return row.join(' ')
  }

  static toTextMessages(messages: any[]): string {
    return this.toArrayMessages(messages, false).join(' ').trim()
  }

  static toArrayMessages<K extends boolean>(messages: any[], keepPrimitives?: K): K extends true ? any[] : string[] {
    return messages.filter(msg => !Base.isMessage(msg) || !msg[STACKTRACE]).map(msg => this.toValueMsg(msg, keepPrimitives))
  }

  static toValueMsg<K extends boolean>(msg: any, keepPrimitives?: K): K extends true ? any : string {
    if (!Base.isMessage(msg)) return this.toValue(msg, keepPrimitives)
    if (msg[TIME] !== undefined) return this.toTextTime(this.toPrettyTime(msg[TIME]))
    if (msg[HIGHLIGHT]) return this.toTextHighlight(`${msg[HIGHLIGHT]}`)
    if (msg[DATETIME]) return this.toTextDateTime(msg[DATETIME])
    return ''
  }

  static toValue(value: any, keepPrimitives?: boolean) {
    if (typeof value === 'symbol') return value.toString()
    return keepPrimitives ? value : `${value}`
  }

  static toPrettyTime(time: number) {
    return prettyTime(1000000 * time, 'ms')
  }

  static toTextTime(time: string) {
    return `[${time}]`
  }

  static toTextHighlight(text: string) {
    return `[${text}]`
  }

  static toTextDateTime(datetime: Date) {
    return datetime?.toJSON()
  }
}
