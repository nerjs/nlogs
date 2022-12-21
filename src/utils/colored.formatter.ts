import { formatWithOptions } from 'util'
import { injectColor } from '../helpers/color'
import { Mod } from '../helpers/mod'
import { ErrorDetails } from '../message/error.details'
import { HighlightMessage } from '../message/highlight.message'
import { MessageInfo } from '../message/message.info'
import { TimeDetails } from '../message/time.details'
import { IFormatter } from './types'

export class ColoredFormatter implements IFormatter {
  format(info: MessageInfo, mod: Mod) {
    return `${this.meta(info, mod)} ${this.message(info)}`
  }

  private meta(info: MessageInfo, mod: Mod) {
    return `${this.timestamp(info.timestamp)} ${injectColor('[', 'grey')}${this.category(info, mod)} ${this.level(info)}${injectColor(
      ']',
      'grey',
    )}`
  }

  private timestamp(date: Date) {
    const hours = `${date.getHours()}`.padStart(2, '0')
    const minutes = `${date.getMinutes()}`.padStart(2, '0')
    const seconds = `${date.getSeconds()}`.padStart(2, '0')
    const ms = date.getMilliseconds() && `${date.getMilliseconds()}`.padStart(3, '0')

    return injectColor(`${hours}:${minutes}:${seconds}${ms ? `.${ms}` : ''}`, ['inverse', 'dim'])
  }

  private category(info: MessageInfo, mod: Mod) {
    let category = injectColor(info.meta.category, ['brightCyan', 'italic'])

    if (mod.type === 'module') category = `${injectColor(mod.id, ['cyan'])}:${category}`

    return category
  }

  private level(info: MessageInfo) {
    const colors = {
      TRACE: 'blue',
      DEBUG: 'magenta',
      INFO: 'green',
      WARN: 'yellow',
      ERROR: 'red',
    }

    const level = info.level.toUpperCase()

    return injectColor(level, [colors[level] || 'white', 'bold'])
  }

  private message(info: MessageInfo) {
    const messages = info.messages.map(msg => {
      if (!msg || typeof msg !== 'object') return msg
      if (msg instanceof TimeDetails) return this.timeDetails(msg)
      if (msg instanceof HighlightMessage) return injectColor(msg.text, 'bold')
      if (msg instanceof ErrorDetails) return this.errorDetails(msg)
      return msg
    })

    if (!info.details.empty) messages.push(info.details.toClearedJSON())
    const stacktraces = this.stacktraces(info)
    if (stacktraces) messages.push(stacktraces)

    return formatWithOptions(
      {
        colors: true,
        depth: info.depth,
      },
      ...messages,
    )
  }

  private timeDetails(time: TimeDetails) {
    let pretty = injectColor(time.pretty, 'brightYellow')
    if (time.label) pretty = `${injectColor(`[${time.label}: `, 'yellow')}${pretty}${injectColor(']', 'yellow')}`
    return pretty
  }

  private errorDetails(error: ErrorDetails) {
    return `${injectColor(`[${error.name}: `, 'red')}${error.message}${injectColor(`]`, 'red')}`
  }

  private stacktraces(info: MessageInfo) {
    const stacktraces: string[] = []

    const add = (stack: string[], label?: string) => {
      if (label) stacktraces.push(label)
      stacktraces.push(...stack.map(str => `  ${str}`))
    }

    ;[info.details._error, ...(info.details._errors || [])].filter(Boolean).forEach(error => add(error.stack, error.toString()))
    ;[info.details._stack, ...(info.details._stacks || [])].filter(Boolean).forEach(stack => {
      if (Array.isArray(stack)) add(stack, stacktraces.length ? '-' : null)
      else add(stack.stack, stack.label)
    })

    if (stacktraces.length) return `\n${stacktraces.join(`\n`)}`
    return null
  }
}
