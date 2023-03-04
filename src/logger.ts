import { BaseLogger, IBaseLoggerOptions } from './base.logger'
import { countOptions, timesOptions } from './options'
import { Cat } from './utils/category'
import { ItemsCounters } from './utils/items.counter'
import { ItemsTimers } from './utils/items.timer'

export interface ILoggerOptions extends IBaseLoggerOptions {}

export class Logger extends BaseLogger<ILoggerOptions> {
  private readonly timers = new ItemsTimers(this, Logger.timeOptions)
  private readonly counters = new ItemsCounters(this, Logger.countOptions)

  constructor(cat?: Cat)
  constructor(cat: Cat | null, options?: Partial<ILoggerOptions>)
  constructor(cat?: Cat | null, options?: Partial<ILoggerOptions>) {
    super(cat, options)
    ;['timers', 'counters'].forEach(key => {
      Object.defineProperty(this, key, {
        value: this[key],
        enumerable: false,
        configurable: true,
      })
    })
  }

  count(label?: string) {
    if (label && this.counters.has(label)) {
      const item = this.counters.get(label)
      item.log()
      return item
    }
    return this.counters.start(label)
  }

  time(label?: string) {
    return this.timers.start(label)
  }

  timeLog(label: string) {
    return this.timers.log(label)
  }

  timeEnd(label: string) {
    return this.timers.end(label)
  }

  static timeOptions = timesOptions
  static countOptions = countOptions
}
