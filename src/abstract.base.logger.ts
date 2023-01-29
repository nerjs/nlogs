import { ILogger } from './helpers/types'
import { StaticLogger } from './utils/static.logger'
import { Mod } from './utils/mod'
import { IFormatter, IOutLogger } from './utils/types'
import { LogReader } from './utils/log.reader'
import { Meta } from './message/meta'
import { LoggingMainRules, loggingRules } from './logging.rules'
import { AllowedList } from './utils/allowed.list'
import { LogInfo } from './message/log.info'
import { TraceStore } from './utils/trace.store'

export interface IAbstractBaseLoggerOptions {
  show?: boolean
  isDev?: boolean
  debugLevels: string[]
  moduleDebugLevels: string[]
  allowedLevels?: string | string[] | null
  hiddenDetails?: Record<string, any>
  strictLevelRules?: boolean
}

export abstract class AbstractBaseLogger<O extends IAbstractBaseLoggerOptions, TD extends object> extends StaticLogger implements ILogger {
  protected abstract readonly module: Mod
  protected abstract readonly meta: Meta
  protected abstract readonly categoriesAllowedList: AllowedList
  protected abstract readonly debugAllowedList: AllowedList
  protected abstract readonly formatter: IFormatter
  protected abstract readonly reader: LogReader
  protected abstract readonly outLogs: IOutLogger
  protected abstract readonly options: O
  protected abstract readonly traceStore: TraceStore<TD>

  log = (...msgs: any[]): void => {
    this.logTo('log', 'out', msgs)
  }

  debug = (...msgs: any[]): void => {
    this.logTo('debug', 'out', msgs)
  }

  trace = (...msgs: any[]): void => {
    this.logTo('trace', 'out', msgs)
  }

  info = (...msgs: any[]): void => {
    this.logTo('info', 'out', msgs)
  }

  warn = (...msgs: any[]): void => {
    this.logTo('warn', 'error', msgs)
  }

  error = (...msgs: any[]): void => {
    this.logTo('error', 'error', msgs)
  }

  fatal = (...msgs: any[]): void => {
    this.logTo('fatal', 'error', msgs)
  }

  protected readMessages(level: string, std: string, msgs: any[]) {
    return this.reader.read(this.meta, [
      StaticLogger.level(level),
      this.module.type === 'module' ? StaticLogger.module(this.module) : StaticLogger.empty(),
      StaticLogger.timestamp(new Date()),
      StaticLogger.traceId(this.traceStore.traceId),
      StaticLogger.hiddenDetails({
        _dev: this.options.isDev,
        _std: std,
        _traceIds: this.traceStore.traceIds,
      }),
      this.traceStore.details ? StaticLogger.details(this.traceStore.details) : StaticLogger.empty(),
      this.options.hiddenDetails ? StaticLogger.hiddenDetails(this.options.hiddenDetails) : StaticLogger.empty(),
      ...msgs,
    ])
  }

  private get loggingRulesModule() {
    return this.module.type === 'module' ? this.module.name : false
  }

  #loggingShowCategory: boolean
  private get loggingShowCategory() {
    if (this.#loggingShowCategory === undefined)
      this.#loggingShowCategory = this.categoriesAllowedList.allow(this.meta.category, this.loggingRulesModule)

    return this.#loggingShowCategory
  }

  #loggingShowDebug: boolean
  private get loggingShowDebug() {
    if (this.#loggingShowDebug === undefined)
      this.#loggingShowDebug = this.debugAllowedList.allow(this.meta.category, this.loggingRulesModule)

    return this.#loggingShowDebug
  }

  #loggingMainRules: LoggingMainRules
  private get loggingMainRules() {
    if (!this.#loggingMainRules) {
      this.#loggingMainRules = {
        debugLevels: this.options.debugLevels,
        moduleDebugLevels: this.options.moduleDebugLevels,
        allowedLevels: this.options.allowedLevels,
        isDev: this.options.isDev,
        isModule: !!this.loggingRulesModule,
        showLogger: this.options.show,
      }
    }

    return this.#loggingMainRules
  }

  protected preCheckLoggingRules(level: string): boolean {
    if (!this.options.strictLevelRules) return true

    return loggingRules(
      level,
      {
        showCategory: this.loggingShowCategory,
        showDebug: this.loggingShowDebug,
      },
      this.loggingMainRules,
    )
  }

  protected postCheckLoggingRules(info: LogInfo) {
    return loggingRules(
      info.meta.level,
      {
        showCategory: this.loggingShowCategory,
        showDebug: this.loggingShowDebug,
        showLog: info.show,
      },
      this.loggingMainRules,
    )
  }

  protected logTo(level: string, std: 'out' | 'error', msgs: any[]) {
    if (!this.preCheckLoggingRules(level)) return
    const info = this.readMessages(level, std, msgs)
    if (!this.postCheckLoggingRules(info)) return

    const str = this.formatter.format(info)
    this.logToOut(std, str)
  }

  protected logToOut(std: 'out' | 'error', message: string) {
    this.outLogs[std](message)
  }
}
