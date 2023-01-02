import { formatWithOptions } from 'util'
import { Mod } from '../helpers/mod'
import { ILogger } from '../helpers/types'
import { ErrorDetails } from '../message/error.details'
import { HighlightMessage } from '../message/highlight.message'
import { MessageInfo } from '../message/message.info'
import { TimeDetails } from '../message/time.details'
import { IFormatter } from './types'

export type WrapFn = (str: string) => string
type LogFormatter = {
  [key in keyof ILogger]: WrapFn
}
export interface ThemeFormatter extends LogFormatter {
  colors: boolean
  depth: number
  emptyStackLabel: string
  showModule: boolean
  showModuleVersion: boolean
  timestamp: WrapFn
  separator: WrapFn
  category: WrapFn
  module: WrapFn
  highlight: WrapFn
  time: WrapFn
  timeLabel?: WrapFn
}

const noop = s => s
const defLogTheme = ['trace', 'debug', 'log', 'info', 'warn', 'error'].reduce(
  (acc, cur) => ({
    ...acc,
    [cur]: noop,
  }),
  {},
) as LogFormatter
const defauldTheme: ThemeFormatter = {
  colors: false,
  depth: 5,
  emptyStackLabel: '-',
  showModule: true,
  showModuleVersion: true,
  timestamp: str => `${str} `,
  separator: noop,
  category: noop,
  module: noop,
  highlight: noop,
  time: noop,
  ...defLogTheme,
}

export class StringFormatter implements IFormatter {
  readonly theme: ThemeFormatter

  constructor(theme?: Partial<ThemeFormatter>) {
    this.theme = Object.assign({}, defauldTheme, theme)
  }

  format(info: MessageInfo, mod: Mod): string {
    return `${this.meta(info, mod)}${this.messages(info)}`
  }

  private meta(info: MessageInfo, mod: Mod) {
    return `${this.timestamp(info.meta.timestamp)}${this.theme.separator('[')}${this.category(info, mod)} ${this.level(
      info,
    )}${this.theme.separator(this.hasMessage(info) ? ']:' : ']')}`
  }

  private timestamp(date: Date) {
    const hours = `${date.getHours()}`.padStart(2, '0')
    const minutes = `${date.getMinutes()}`.padStart(2, '0')
    const seconds = `${date.getSeconds()}`.padStart(2, '0')
    const ms = `${date.getMilliseconds()}`.padStart(3, '0')
    return this.theme.timestamp(`${hours}:${minutes}:${seconds}${ms}`)
  }

  private category(info: MessageInfo, mod: Mod) {
    const category = this.theme.category(info.meta.category)
    if (!this.theme.showModule) return category
    const module = this.module(mod)
    if (!module) return category
    return `${module}${this.theme.separator(':')}${category}`
  }

  private module(mod: Mod) {
    if (mod.type === 'app') return null
    return this.theme.module(this.theme.showModuleVersion ? `${mod.name}@${mod.version}` : mod.name)
  }

  private level(info: MessageInfo) {
    const lower = info.level.toLowerCase()
    const level = lower.toUpperCase()
    const wrap = lower in this.theme && typeof this.theme[lower] === 'function' ? this.theme[lower] : this.theme.log

    return wrap(level)
  }

  private messages(info: MessageInfo) {
    if (!this.hasMessage(info)) return ''

    const stacktraces = this.stacktraces(info)
    const count = info.messages.length

    const messages = info.messages.map(msg => {
      if (!msg || typeof msg !== 'object') return msg
      if (msg instanceof HighlightMessage) return this.wrapNotOnce(this.theme.highlight(msg.text), count)
      if (msg instanceof TimeDetails) return this.timeDetails(msg, count)
      if (msg instanceof ErrorDetails) return this.errorDetails(msg, count)
      return msg
    })

    if (!info.details.empty) messages.push(info.details.toClearedJSON())
    if (stacktraces) messages.push(stacktraces)

    return formatWithOptions(
      {
        colors: this.theme.colors,
        depth: info.depth ?? this.theme.depth,
      },
      ' ',
      ...messages,
    )
  }

  private timeDetails(time: TimeDetails, count: number) {
    const wrapLabel = this.theme.timeLabel || this.theme.highlight
    return time.label
      ? this.wrapNotOnce(`${wrapLabel(time.label)}${wrapLabel(':')} ${this.theme.time(time.pretty)}`, count, this.theme.timeLabel)
      : this.theme.time(time.pretty)
  }

  private errorDetails(error: ErrorDetails, count: number) {
    return this.wrapNotOnce(error.toString(), count)
  }

  private stacktraces(info: MessageInfo) {
    const stacktraces: string[] = []

    const add = (stack: string[], label?: string) => {
      if (label) stacktraces.push(label)
      stacktraces.push(...stack.map(str => `  ${str}`))
    }

    ;[info.details._error, ...(info.details._errors || [])].filter(Boolean).forEach(error => add(error.stack, error.toString()))
    ;[info.details._stack, ...(info.details._stacks || [])].filter(Boolean).forEach(stack => {
      if (Array.isArray(stack)) add(stack, stacktraces.length ? this.theme.emptyStackLabel : null)
      else add(stack.stack, stack.label)
    })

    if (stacktraces.length) return `\n${stacktraces.join(`\n`)}`
    return null
  }

  private wrapNotOnce(str: string, count: number, wrapFn?: WrapFn) {
    if (count <= 1) return str
    if (!wrapFn) return this.wrapNotOnce(str, count, this.theme.separator)
    return `${wrapFn('[')}${str}${wrapFn(']')}`
  }

  private hasMessage(info: MessageInfo) {
    return info.messages.length || !info.details.empty || info.details._stack || info.details._stacks
  }
}
