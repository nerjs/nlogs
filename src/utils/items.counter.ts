import { ItemManagerOptions, ItemMsg, ItemResult, ItemsManager } from './items.manager'
import { StaticLogger } from './static.logger'

export interface ItemCounterOptions extends ItemManagerOptions {}

export class ItemsCounters extends ItemsManager<number, ItemCounterOptions> {
  readonly name = 'timer'
  protected defaultData = 0

  protected itemCallback(msg: ItemMsg<number>): ItemResult<number> {
    const count = msg.data + 1
    return {
      level: 'debug',
      data: count,
      messages: [
        StaticLogger.highlight(`count${msg.label ? ` (${msg.label})` : ''}: `),
        count,
        msg.messages?.length ? StaticLogger.interpolate(['|', ...msg.messages]) : StaticLogger.empty(),
      ],
    }
  }
}
