import { AbstractBaseLogger, IAbstractBaseLoggerOptions } from './abstract.base.logger'
import { Meta } from './message/meta'
import { AllowedList } from './utils/allowed.list'
import { Cat, Category } from './utils/category'
import { LogReader } from './utils/log.reader'
import { Mod } from './utils/mod'
import { ModResolver } from './utils/mod.resolver'
import { TraceStore, WithTraceId } from './utils/trace.store'
import { getTopStackFile } from './helpers/stack'
import { IFormatter, IOutLogger } from './utils/types'
import { ConsoleOut } from './utils/console.out'
import { JsonFormatter } from './utils/json.formatter'
import { StringFormatter } from './utils/string.formatter'
import { LightStringFormatter } from './utils/light.string.formatter'
import { DarkStringFormatter } from './utils/dark.string.formatter'
import { loggerOptions } from './options'
import { MaybePromise } from './helpers/types'

export interface BaseTraceDetails {}

export interface IBaseLoggerOptions {
  show?: boolean
  index?: string
}

type BaseOptions<T extends IBaseLoggerOptions> = typeof loggerOptions & IAbstractBaseLoggerOptions & Partial<T>

export class BaseLogger<T extends IBaseLoggerOptions> extends AbstractBaseLogger<BaseOptions<T>, BaseTraceDetails> {
  protected categoriesAllowedList: AllowedList = this.staticLogger.categoriesAllowedList
  protected debugAllowedList: AllowedList = this.staticLogger.debugAllowedList
  protected formatter: IFormatter = this.staticLogger.formatter
  protected reader: LogReader = this.staticLogger.reader
  protected outLogs: IOutLogger = this.staticLogger.outLogs
  protected traceStore: TraceStore<BaseTraceDetails> = this.staticLogger.traceStore

  readonly module: Mod
  readonly meta: Meta
  protected options: BaseOptions<T>

  constructor(cat?: Cat)
  constructor(cat: Cat | null, options?: Partial<T>)
  constructor(cat?: Cat | null, options?: Partial<T>) {
    super()

    const pathname = getTopStackFile(this.constructor)
    this.module = this.staticLogger.moduleResolver.resolve(pathname)
    const category = new Category(this.module, cat || Category.relativePath(pathname, this.module))
    this.meta = this.staticLogger.defaultMeta.clone()
    if (!this.meta.service) this.meta.set('service', this.module.name)
    this.meta.set('category', category.name)
    this.meta.set('traceId', this.traceStore.traceId)
    this.meta.set('timestamp', new Date())

    this.options = {
      ...this.staticLogger.loggerOptions,
      ...(options || {}),
    } as BaseOptions<T>

    if (options?.index) this.meta.set('index', options.index)
    if (options?.show != null) this.options.show = options.show
    ;['traceStore', 'categoriesAllowedList', 'debugAllowedList', 'formatter', 'reader', 'outLogs', 'traceStore', 'options'].forEach(key => {
      Object.defineProperty(this, key, {
        value: this[key],
        enumerable: false,
        configurable: true,
      })
    })

    const categoryName = this.meta.category.replace(/\s+/g, '_')
    Object.keys(this)
      .filter(key => typeof this[key] === 'function' && !this[key].name)
      .forEach(key =>
        Object.defineProperty(this[key], 'name', {
          value: `${categoryName}~${key}`,
        }),
      )
  }

  get staticLogger() {
    return this.constructor as typeof BaseLogger
  }

  show(value: boolean) {
    this.options.show = !!value
  }

  static moduleResolver: ModResolver = new ModResolver()

  static loggerOptions = (() => {
    const opt = { ...loggerOptions }
    opt.hiddenDetails._app = this.moduleResolver.app
    return opt
  })()

  static categoriesAllowedList = new AllowedList(this.loggerOptions.categoriesAllowedList)
  static debugAllowedList = new AllowedList(this.loggerOptions.debugAllowedList)

  static formatter: IFormatter = (() => {
    switch (this.loggerOptions.formatterType) {
      case 'json':
        return new JsonFormatter()
      case 'string':
        return new StringFormatter()
      case 'light':
        return new LightStringFormatter()
      case 'dark':
        return new DarkStringFormatter()
    }
  })()

  static reader: LogReader = new LogReader(this.formatter)

  static outLogs: IOutLogger = new ConsoleOut(process.stdout, process.stderr)

  static traceStore: TraceStore<BaseTraceDetails> = new TraceStore()

  static defaultMeta: Meta = new Meta(
    this.loggerOptions.defaultProject,
    this.loggerOptions.defaultService,
    this.loggerOptions.defaultCategory,
    'log',
    '',
    new Date(),
  )

  static setTraceDetails(traceDetails: Record<string, any>) {
    this.traceStore.setDetails(traceDetails)
  }

  static mergeTraceDetails(traceDetails: Record<string, any>) {
    this.traceStore.mergeDetails(traceDetails)
  }

  static run<R extends MaybePromise<any>>(callback: () => R): R
  static run<R extends MaybePromise<any>>(traceId: string, callback: () => R): R
  static run<R extends MaybePromise<any>, D extends WithTraceId>(details: D, callback: () => R): R
  static run<R extends MaybePromise<any>, D extends WithTraceId>(callBackOrDetOtrId: (() => R) | string | D, callback?: () => R): R {
    return this.traceStore.run(callBackOrDetOtrId as any, callback)
  }
}
