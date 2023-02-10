import { AbstractBaseLogger, IAbstractBaseLoggerOptions } from './abstract.base.logger'
import { Meta } from './message/meta'
import { AllowedList } from './utils/allowed.list'
import { Cat, Category } from './utils/category'
import { LogReader } from './utils/log.reader'
import { Mod } from './utils/mod'
import { ModResolver } from './utils/mod.resolver'
import { TraceStore } from './utils/trace.store'
import { getTopStackFile } from './helpers/stack'
import { IFormatter, IOutLogger } from './utils/types'
import { ConsoleOut } from './utils/console.out'
import { JsonFormatter } from './utils/json.formatter'
import { StringFormatter } from './utils/string.formatter'
import { LightStringFormatter } from './utils/light.string.formatter'
import { DarkStringFormatter } from './utils/dark.string.formatter'
import options from './options'
import { MaybePromise } from './helpers/types'

export interface BaseTraceDetails {}

export interface IBaseLoggerOptions {
  show?: boolean
  index?: string
}

type BaseOptions<T extends IBaseLoggerOptions> = typeof options & IAbstractBaseLoggerOptions & Partial<T>

export class BaseLogger<T extends IBaseLoggerOptions> extends AbstractBaseLogger<BaseOptions<T>, BaseTraceDetails> {
  protected categoriesAllowedList: AllowedList = BaseLogger.categoriesAllowedList
  protected debugAllowedList: AllowedList = BaseLogger.debugAllowedList
  protected formatter: IFormatter = BaseLogger.formatter
  protected reader: LogReader = BaseLogger.reader
  protected outLogs: IOutLogger = BaseLogger.outLogs
  protected traceStore: TraceStore<BaseTraceDetails> = BaseLogger.traceStore

  protected module: Mod
  protected meta: Meta
  protected options: BaseOptions<T>

  constructor(cat?: Cat)
  constructor(cat: Cat | null, options?: Partial<T>)
  constructor(cat?: Cat | null, options?: Partial<T>) {
    super()

    const pathname = getTopStackFile(this.constructor)
    this.module = BaseLogger.moduleResolver.resolve(pathname)
    const category = new Category(this.module, cat || Category.relativePath(pathname, this.module))
    this.meta = BaseLogger.defaultMeta.clone()
    if (!this.meta.service) this.meta.set('service', this.module.name)
    this.meta.set('category', category.name)
    this.meta.set('traceId', this.traceStore.traceId)
    this.meta.set('timestamp', new Date())

    this.options = {
      ...BaseLogger.options,
      ...(options || {}),
    } as BaseOptions<T>

    if (options?.index) this.meta.set('index', options.index)
    if (options?.show != null) this.options.show = options.show
    ;['traceStore', 'categoriesAllowedList', 'debugAllowedList', 'formatter', 'reader', 'out', 'traceStore', 'options'].forEach(key => {
      Object.defineProperty(this, key, {
        value: this[key],
        enumerable: false,
        configurable: true,
      })
    })
  }

  show(value: boolean) {
    this.options.show = !!value
  }

  static moduleResolver: ModResolver = new ModResolver()

  static options = (() => {
    const opt = { ...options }
    opt.hiddenDetails._app = this.moduleResolver.app
    return opt
  })()

  static categoriesAllowedList = new AllowedList(this.options.categoriesAllowedList)
  static debugAllowedList = new AllowedList(this.options.debugAllowedList)

  static formatter: IFormatter = (() => {
    switch (this.options.formatterType) {
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
    this.options.defaultProject,
    this.options.defaultService,
    this.options.defaultCategory,
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

  static run<R extends MaybePromise<any>>(callback: () => R): R {
    return this.traceStore.run(callback)
  }
}
