import { Info } from '../message/info'
import { Meta } from '../message/meta'
import { Parser, ParserOptions } from './Parser'
import {
  CATEGORY,
  DEPTH,
  DETAILS,
  HIGHLIGHT,
  INDEX,
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
import { IFormatter, ILogger, IOutLogger } from './types'

export interface BaseOptions extends ParserOptions {}

export class Base {
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

  static createBase(typeSymbol: symbol, key: symbol, value: any, obj?: object) {
    return {
      [typeSymbol]: true,
      [key]: value,
      ...(obj || {}),
    }
  }

  static toMessage(key: symbol, value: any, obj?: object) {
    return this.createBase(IS_MESSAGE, key, value, obj)
  }

  static toMeta(key: symbol, value: any, obj?: object) {
    return this.createBase(IS_META, key, value, obj)
  }

  static toDetails(key: symbol, value: any, obj?: object) {
    return this.createBase(IS_DETAILS, key, value, obj)
  }

  // messages
  static time(ms: number, label?: string) {
    return this.toMessage(TIME, ms, {
      [LABEL]: label,
    })
  }

  static highlight(text: string) {
    return this.toMessage(HIGHLIGHT, text)
  }

  static stacktrace(stack: string | string[], label?: string) {
    return this.toMessage(STACKTRACE, stack, {
      [LABEL]: label,
    })
  }

  // details
  static details(obj: Record<string, any>) {
    return this.toDetails(DETAILS, obj)
  }

  static depth(depth: number) {
    return this.toDetails(DEPTH, depth)
  }

  static noConsole(obj: Record<string, any>) {
    return this.toDetails(NO_CONSOLE, obj)
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
    return this.toMeta(SHOW, value === undefined || !!value)
  }
}
