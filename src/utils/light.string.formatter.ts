import { injectColor } from '../helpers/color'
import { Meta } from '../message/meta'
import { DarkStringFormatter } from './dark.string.formatter'

export class LightStringFormatter extends DarkStringFormatter {
  time(pretty: string, label?: string): string {
    const time = injectColor(pretty, ['yellow'])
    return label ? `${injectColor(`[${label}:`, 'bold')} ${time}${injectColor(']', 'bold')}` : time
  }

  protected prepareCategoryName(meta: Meta): string {
    return injectColor(meta.category, ['cyan', 'italic'])
  }
}
