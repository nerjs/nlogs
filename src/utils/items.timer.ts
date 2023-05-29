import { TIME_END, TIME_LOG } from '../constants'
import { ItemManagerOptions, ItemMsg, ItemResult, ItemsManager, LogType } from './items.manager'
import { StaticLogger } from './static.logger'

export interface ItemTimerOptions extends ItemManagerOptions {
  logOnStart: boolean
}

export class ItemsTimers extends ItemsManager<number, ItemTimerOptions> {
  readonly name = 'timer'
  protected defaultData = Date.now()

  protected itemCallback(msg: ItemMsg<number>): ItemResult<number> {
    const messages = msg.messages?.length ? StaticLogger.interpolate(['|', ...msg.messages]) : StaticLogger.empty()

    switch (msg.type) {
      case LogType.START:
        return {
          data: Date.now(),
          level: 'debug',
          messages: this.options.logOnStart
            ? [StaticLogger.highlight(`timeStart${msg.label ? `: ${msg.label}` : ''}`), messages]
            : undefined,
        }

      case LogType.LOG:
        return {
          level: 'debug',
          messages: [StaticLogger.timeRange(msg.data, Date.now(), `${TIME_LOG}${msg.label ? `: ${msg.label}` : ''}`), messages],
        }

      case LogType.END:
        return {
          level: 'debug',
          messages: [StaticLogger.timeRange(msg.data, Date.now(), `${TIME_END}${msg.label ? `: ${msg.label}` : ''}`), messages],
        }
    }
  }
}
