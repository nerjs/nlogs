import {
  CATEGORY,
  DEPTH,
  DETAILS,
  EMPTY,
  HIGHLIGHT,
  INDEX,
  INTERPOLATE,
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
  toMeta,
  toMetaInfo,
  TRACE_ID,
} from '../helpers/symbols'
import { MetaInfo } from '../helpers/types'

export class StaticLogger {
  /*
  private readonly parser: Parser
  constructor(
    private readonly formatter: IFormatter,
    private readonly out: IOutLogger,
    private readonly options: BaseOptions,
    private readonly defaultMeta: Meta,
  ) {
    this.parser = new Parser(this.options, this.defaultMeta)
  }

  log(...data: any[]) {
    const info = this.parser.parse(data)
    if (!info.meta.show) return
    const msgs = this.formatter.format(info)
    const level =
      info.meta.level in this.out && typeof this.out[info.meta.level] === 'function'
        ? info.meta.level
        : (info.meta.level === 'error' || info.meta.level === 'warn') && 'error' in this.out && typeof this.out.error === 'function'
        ? 'error'
        : 'log'

    this.out[level]?.(...msgs)
  }
  */

  static toMetaInfo(key: symbol, value: any) {
    return toMetaInfo({ [key]: value })
  }

  static toMeta(key: symbol, value: any) {
    return toMeta({ [key]: value })
  }

  // messages
  static time(ms: number, label?: string) {
    return this.toMetaInfo(TIME, { ms, label })
  }

  static highlight(text: string) {
    return this.toMetaInfo(HIGHLIGHT, text)
  }

  static stacktrace(stack: string | string[], label?: string) {
    return this.toMetaInfo(STACKTRACE, { stack, label })
  }

  // details
  static details(obj: Record<string, any>) {
    return this.toMetaInfo(DETAILS, obj)
  }

  static depth(depth: number) {
    return this.toMetaInfo(DEPTH, depth)
  }

  static noConsole(obj: Record<string, any>) {
    return this.toMetaInfo(NO_CONSOLE, obj)
  }

  static timeRange(from: number | Date, to?: number | Date): MetaInfo
  static timeRange(from: number | Date, label?: string): MetaInfo
  static timeRange(from: number | Date, to: number | Date, label?: string): MetaInfo
  static timeRange(from: number | Date, toOrLabel?: number | Date | string, label?: string) {
    return this.toMetaInfo(TIMERANGE, {
      from,
      to: typeof toOrLabel !== 'string' ? toOrLabel : undefined,
      label: typeof toOrLabel === 'string' ? toOrLabel : label,
    })
  }

  // meta

  static module(module: string) {
    return this.toMeta(MODULE, module)
  }
  static project(project: string) {
    return this.toMeta(PROJECT, project)
  }
  static service(service: string) {
    return this.toMeta(SERVICE, service)
  }
  static category(category: string) {
    return this.toMeta(CATEGORY, category)
  }
  static level(level: string) {
    return this.toMeta(LEVEL, level)
  }
  static traceId(traceId: string) {
    return this.toMeta(TRACE_ID, traceId)
  }
  static index(index: string) {
    return this.toMeta(INDEX, index)
  }
  static timestamp(timestamp: Date) {
    return this.toMeta(TIMESTAMP, timestamp)
  }

  static show(value?: boolean) {
    return this.toMetaInfo(SHOW, value === undefined || !!value)
  }

  static interpolate(data: any[]) {
    return this.toMetaInfo(INTERPOLATE, data)
  }

  static empty() {
    return this.toMetaInfo(EMPTY, true)
  }
}
