import { Base } from './utils/Base'
import { Transport } from './utils/Transport'
import { Cat, Category } from './utils/Cetegory'
import { Index } from './utils/Index'
import { Paths } from './utils/Paths'
import { LocalStore, LogTime, MaybePromise } from './utils/types'
import { LogTimerManager } from './utils/LogTimer'
import { getStackTrace } from './helpers/stack'
import { parseTemplate } from './helpers/template'
import traceStore from './utils/traceStore'

export interface LoggerOptions {
  index:
    | string
    | {
        prefix?: string
        sufix?: string
      }
  category?: {
    allow?: boolean
  }
  allowed: {
    console: boolean
    file: boolean
    elasticsearch: boolean
  }
}

export const defaultTransport = new Transport()

export class Logger extends Base {
  readonly paths: Paths
  readonly category: Category
  readonly index: Index
  readonly timers = new LogTimerManager(this)
  readonly transport = defaultTransport
  readonly traceStore = traceStore

  constructor(cat?: Cat, readonly options?: LoggerOptions) {
    super()
    this.paths = new Paths(this)
    this.category = new Category(this.paths, cat)
    this.index = new Index(this.paths, this.category)

    if (options?.category?.allow) this.category.allow()
  }

  log(...msgs: any[]) {
    this.transport.log(
      Logger.level('log'),
      Logger.meta(traceStore.meta || {}),
      Logger.project(this.paths.project),
      Logger.service(this.paths.service),
      Logger.category(this.category.name),
      Logger.timestamp(new Date()),
      Logger.traceId(this.traceId),
      Logger.index(this.index.name),
      ...(traceStore.details ? [traceStore.details] : []),
      ...parseTemplate(msgs),
    )
  }

  debug(...msgs: any[]) {
    this.log(
      Logger.level('debug'),
      Logger.allowed({
        console: this.category.allowed,
        file: false,
        elasticsearch: true,
      }),
      ...parseTemplate(msgs),
    )
  }

  info(...msgs: any[]) {
    this.log(Logger.level('info'), ...parseTemplate(msgs))
  }

  warn(...msgs: any[]) {
    this.log(Logger.level('warn'), ...parseTemplate(msgs))
  }

  error(...msgs: any[]) {
    this.log(Logger.level('error'), ...parseTemplate(msgs))
  }

  time(label?: string): LogTime
  time(label?: string, ...msgs: any[]): LogTime
  time(...msgs: any[]): LogTime {
    return this.timers.time(...msgs)
  }

  timeLog(label: string, ...msgs: any[]) {
    return this.timers.log(label, ...msgs)
  }

  timeEnd(label: string, ...msgs: any[]) {
    return this.timers.end(label, ...msgs)
  }

  dir(obj: object, depth: number | { depth: number } = 10) {
    this.debug(Logger.highlight('dir'), obj, Logger.depth(typeof depth === 'number' ? depth : depth?.depth || 10))
  }

  trace(...msgs: any) {
    const stack = getStackTrace(this.trace)
    this.debug(Logger.highlight('trace'), Logger.stacktrace(stack), ...msgs)
  }

  get traceId() {
    return traceStore.traceId
  }

  static run<R extends MaybePromise<any>>(callback: () => R): R
  static run<R extends MaybePromise<any>>(traceId: string, callback: () => R): R
  static run<R extends MaybePromise<any>>(store: Partial<LocalStore>, callback: () => R): R
  static run<R extends MaybePromise<any>>(storeOrCallback: Partial<LocalStore> | string | (() => R), callback?: () => R): MaybePromise<R> {
    if (typeof storeOrCallback === 'string') return this.run({ traceId: storeOrCallback }, callback)
    if (typeof storeOrCallback === 'function') return this.run({}, storeOrCallback)
    return traceStore.run<R>(storeOrCallback, callback)
  }
}
