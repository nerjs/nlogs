import { injectColor } from '../helpers/color'
import { ThemeFormatter } from './string.formatter'

export const commonTheme: Partial<ThemeFormatter> = {
  separator: str => injectColor(str, 'gray'),
  timestamp: str => injectColor(str, ['bgGray', 'brightYellow']),
  module: str => injectColor(str, ['cyan']),
  category: str => injectColor(str, ['brightCyan', 'italic']),
  log: str => injectColor(str, 'white'),
  trace: str => injectColor(str, 'blue'),
  debug: str => injectColor(str, 'magenta'),
  info: str => injectColor(str, 'green'),
  warn: str => injectColor(str, 'yellow'),
  error: str => injectColor(str, 'red'),
  highlight: str => injectColor(str, 'bold'),
  time: str => injectColor(str, ['brightYellow']),
  timeLabel: str => injectColor(str, ['yellow']),
  colors: true,
}

export const darkTheme: Partial<ThemeFormatter> = {
  ...commonTheme,
}

export const lightTheme: Partial<ThemeFormatter> = {
  ...commonTheme,
  category: str => injectColor(str, ['cyan', 'italic']),
  time: str => injectColor(str, ['yellow']),
  timeLabel: str => injectColor(str, ['bold']),
}
