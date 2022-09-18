import { AsyncLocalStorage } from 'async_hooks'
import { v4 as uuid } from 'uuid'
import { Base } from './utils/Base'
import { Transport } from './utils/Transport'
import { Cat, Category } from './utils/Cetegory'
import { Index } from './utils/Index'
import { Paths } from './utils/Paths'
import { LocalStore, LogTime, PromiseLike, StoreDetails } from './utils/types'
import { LogTimerManager } from './utils/LogTimer'
import { getStackTrace } from './helpers/stack'
import { parseTemplate } from './helpers/template'

export interface LoggerOptions {
  transport?: Transport
  index?: {
    strict?: boolean
  }
  category?: {
    allow?: boolean
  }
}

export const defaultTransport = new Transport()

export class Logger extends Base {
  readonly paths: Paths
  readonly category: Category
  readonly index: Index
  readonly timers = new LogTimerManager(this)
  readonly transport: Transport

  constructor(cat?: Cat, options?: LoggerOptions) {
    super()
    this.paths = new Paths(this)
    this.category = new Category(this.paths, cat)
    this.index = new Index(this.paths, this.category)
    this.transport = options?.transport || defaultTransport

    if (options?.index?.strict) this.index.strict(!!options.index.strict)
    if (options?.category?.allow) this.category.allow()
  }

  log(...msgs: any[]) {
    this.transport.log(
      Logger.level('log'),
      Logger.project(this.paths.project),
      Logger.service(this.paths.service),
      Logger.category(this.category.name),
      Logger.timestamp(new Date()),
      ...parseTemplate(msgs),
    )
  }

  debug(...msgs: any[]) {
    this.log(Logger.level('debug'), Logger.show(this.category.allowed), ...parseTemplate(msgs))
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

  get store() {
    return Logger.getStore()
  }

  get details() {
    return Logger.getStoreDetails()
  }

  get traceId() {
    return this.store?.traceId
  }

  static asyncLocalStore: AsyncLocalStorage<LocalStore>
  static get store(): AsyncLocalStorage<LocalStore> {
    if ('asyncLocalStore' in Logger) return Logger.asyncLocalStore
    Logger.asyncLocalStore = new AsyncLocalStorage<LocalStore>()
    return Logger.asyncLocalStore
  }

  static getStore<T extends StoreDetails = any>(): LocalStore<T> | undefined {
    return Object.assign({}, this.store.getStore())
  }

  static getStoreDetails<T extends StoreDetails = any>(): T | undefined {
    return this.getStore()?.details
  }

  static setStoreDetails<T extends StoreDetails = any>(store: Partial<T>) {
    const details = Object.assign({}, this.getStoreDetails(), store)
    Object.assign(this.store.getStore(), { details })
  }

  static replaceStoreDetails<T extends StoreDetails = any>(details: T) {
    Object.assign(this.store.getStore(), { details })
  }

  static run<R extends PromiseLike<any>>(callback: () => R): R
  static run<R extends PromiseLike<any>, T extends StoreDetails = Record<string, any>>(store: T, callback: () => R): R
  static run<R extends PromiseLike<any>, T extends StoreDetails = Record<string, any>>(
    storeOrCallback: T | (() => R),
    callback?: () => R,
  ): R {
    const traceId = this.getStore()?.traceId || uuid()
    const details = typeof storeOrCallback === 'object' && storeOrCallback
    const runCallback = typeof storeOrCallback === 'function' ? (storeOrCallback as Function) : callback
    const store = { traceId, details }

    return this.store.run<any, any>(store, runCallback as () => R)
  }
}
