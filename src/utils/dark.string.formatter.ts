import { injectColor } from '../helpers/color'
import { Details } from '../message/details'
import { LogInfo } from '../message/log.info'
import { Meta } from '../message/meta'
import { StringFormatter } from './string.formatter'

export class DarkStringFormatter extends StringFormatter {
  readonly timestampSeparator = ''
  readonly separator = injectColor(':', 'gray')
  readonly brackets: [string, string] = [injectColor('[', 'gray'), injectColor(']', 'gray')]
  readonly colors = true
  protected levels = {
    log: str => injectColor(str, 'white'),
    trace: str => injectColor(str, 'blue'),
    debug: str => injectColor(str, 'magenta'),
    info: str => injectColor(str, 'green'),
    warn: str => injectColor(str, 'yellow'),
    error: str => injectColor(str, 'red'),
  }

  highlight(text: string): string {
    return injectColor(text, 'bold')
  }

  time(pretty: string, label: string | null, info: LogInfo): string {
    const time = injectColor(pretty, ['brightYellow'])
    return label ? this.wrap(`${injectColor(`${label}:`, 'yellow')} ${time}`, info.messages.length) : time
  }

  protected prepareTimestamp(date: Date): string {
    return injectColor(`${super.prepareTimestamp(date)}`, ['bgGray', 'brightYellow'])
  }

  protected prepareCategoryName(meta: Meta): string {
    return injectColor(super.prepareCategoryName(meta), ['brightCyan', 'italic'])
  }

  protected prepareModuleName(details: Details): string {
    const mod = super.prepareModuleName(details)
    if (!mod) return mod
    return injectColor(mod, ['cyan'])
  }

  protected prepareLevel(meta: Meta): string {
    const methodName = meta.level.toLowerCase()
    return (this.levels[methodName] || this.levels.log)(meta.level.toUpperCase())
  }
}
