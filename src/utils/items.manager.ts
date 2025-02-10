import { ItemNotFoundError } from '../errors/item.notfound.error'
import prettyTime from 'pretty-time'
import { uuid } from '../helpers/string'
import { ILogger } from '../helpers/types'

type LogFn = (...msgs: any[]) => void

export interface LogItem<D = any> {
  (...args: any[]): void
  id: string
  label: string
  log(...args: any[]): void
  end(...args: any[]): void
  removeAfter: number
  data: D
}

export enum LogType {
  START = 'start',
  LOG = 'log',
  END = 'end',
}

export interface ItemMsg<D> {
  type: LogType
  data: D
  messages: any[]
  label?: string
}

export interface ItemResult<D> {
  data?: D
  level?: keyof ILogger
  messages?: any[]
}

export interface ItemManagerOptions {
  maxCacheTime: number
  checkCacheTimeout: number
  maxCacheSize: number
}

export abstract class ItemsManager<D, O extends ItemManagerOptions> {
  private readonly state = new Map<string, LogItem<D>>()
  private readonly removed = new WeakSet<LogItem<D>>()
  private tid: NodeJS.Timeout

  abstract readonly name: string
  protected abstract itemCallback(msg: ItemMsg<D>): ItemResult<D> | ItemResult<D>[]
  protected abstract defaultData: D

  constructor(
    private readonly logger: ILogger,
    protected readonly options: O,
  ) {}

  get size() {
    return this.state.size
  }

  has(id: string) {
    if (!this.state.has(id)) return false
    return !this.removed.has(this.state.get(id))
  }

  get(id: string): LogItem<D> {
    if (!this.has(id)) throw new ItemNotFoundError(this.name, id)
    return this.state.get(id)
  }

  delete(id: string) {
    return this.state.delete(id)
  }

  clear() {
    this.state.clear()
  }

  private create(id: string, onLog: LogFn, onEnd: LogFn, label?: string) {
    const item: LogItem<D> = (...args: any[]) => onEnd(...args)
    item.id = id
    item.label = label
    item.log = onLog
    item.end = onEnd
    item.removeAfter = Date.now() + this.options.maxCacheTime
    item.data = this.defaultData

    return item
  }

  start(label?: string): LogItem<D> {
    const id = label || uuid()
    if (this.has(id)) {
      const sitem = this.get(id)
      this.delete(id)
      if (!this.isExpired(sitem) && !this.removed.has(sitem)) {
        sitem.end('Auto end (restart)')
      }
      return this.start(label)
    }

    const item = this.create(
      id,
      (...msgs: any[]) => {
        if (this.removed.has(item)) return
        this.logFrom(LogType.LOG, item, msgs)
      },
      (...msgs) => {
        if (this.removed.has(item)) return
        this.delete(id)
        this.removed.add(item)
        this.logFrom(LogType.END, item, msgs)
      },
      label,
    )
    this.state.set(id, item)
    if (this.size > this.options.maxCacheSize)
      this.logger.warn(`The recommended limit for concurrently used ${this.name} has been exceeded`)
    this.logFrom(LogType.START, item, [])
    return item
  }

  log(label: string) {
    if (!label) return this.logger.warn(`[${this.name}]: the label cannot be empty when the log method is called`)
    if (!this.has(label)) return this.logger.warn(`${this.name} with "${label}" label not found`)
    const item = this.get(label)
    item.log()
  }

  end(label: string) {
    if (!label) return this.logger.warn(`[${this.name}]: the label cannot be empty when the end method is called`)
    if (!this.has(label)) return this.logger.warn(`${this.name} with "${label}" label not found`)
    const item = this.get(label)
    item.end()
    return
  }

  private logFrom(type: LogType, item: LogItem<D>, messages: any[]) {
    try {
      const res = this.itemCallback({
        type,
        messages,
        label: item.label,
        data: item.data,
      })

      const arr = Array.isArray(res) ? res : [res]
      for (const result of arr) {
        if (!result) continue
        if ('data' in result) item.data = result.data
        if (!result.messages) continue
        const method = 'level' in result ? result.level : 'debug'
        this.logger[method](...result.messages)
      }

      item.removeAfter = Date.now() + this.options.maxCacheTime
      this.checkItem(item)
    } catch (err) {
      this.logger.error('Error during itemCallback execution', err)
    }
  }

  // helpers

  private isExpired(item: LogItem) {
    return item.removeAfter <= Date.now()
  }

  // autoclear

  private checkItem(item: LogItem) {
    if (!this.size && this.tid) clearTimeout(this.tid)
    if (!this.removed.has(item) && !this.tid) this.startTimeoutCheck()
  }

  private startTimeoutCheck() {
    // if (this.tid) clearTimeout(this.tid)
    this.tid = setTimeout(() => {
      this.tid = null

      this.state.forEach(item => {
        if (+item.removeAfter <= Date.now()) {
          this.removed.add(item)
          this.delete(item.id)
          this.logger.warn(
            `The ${this.name} with the ${item.label ? `${item.label} label` : `${item.id} id`} was deleted after ${prettyTime(
              1000000 * this.options.maxCacheTime,
              'ms',
            )} of inactivity`,
          )
        }
      })

      if (this.size) this.startTimeoutCheck()
    }, this.options.checkCacheTimeout).unref()
  }
}
