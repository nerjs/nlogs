import { formatWithOptions } from 'util'
import { Details } from '../message/details'
import { Meta } from '../message/meta'
import { IFormatter } from './types'

export class StringFormatter implements IFormatter {
  symbol(value: symbol) {
    return value
  }
  bigint(value: bigint) {
    return value
  }
  date(value: Date) {
    return value
  }
  array(value: any[]) {
    return value
  }
  null(value: null | undefined) {
    return value
  }

  protected separator = ':'
  protected timestampSeparator = ' '
  protected brackets = ['[', ']']
  protected colors = false
  protected depth = 10

  messages(data: any[]): string {
    return formatWithOptions(
      {
        colors: this.colors,
      },
      ...data,
    )
  }

  time(pretty: string, label?: string): string {
    return label ? `[${label}: ${pretty}]` : pretty
  }

  error(name: string, message: string): string {
    return `[${name}: ${message}]`
  }

  highlight(text: string): string {
    return `[${text}]`
  }

  format(meta: Meta, details: Details, message: string): string {
    const msg = this.prepareMessage(message, details)
    return `${this.prepareTimestamp(meta.timestamp)}${this.timestampSeparator}${this.brackets[0]}${this.prepareCategory(
      meta,
      details,
    )} ${this.prepareLevel(meta)}${this.brackets[1]}${msg.length ? `${this.separator} ${msg}` : ''}`
  }

  protected prepareTimestamp(date: Date) {
    const hours = `${date.getHours()}`.padStart(2, '0')
    const minutes = `${date.getMinutes()}`.padStart(2, '0')
    const seconds = `${date.getSeconds()}`.padStart(2, '0')
    const ms = `${date.getMilliseconds()}`.padStart(3, '0')
    return `${hours}:${minutes}:${seconds}.${ms}`
  }

  protected prepareCategory(meta: Meta, details: Details) {
    const category = this.prepareCategoryName(meta)
    const mod = this.prepareModuleName(details)
    return mod ? `${mod}${this.separator}${category}` : category
  }

  protected prepareCategoryName(meta: Meta) {
    return meta.category
  }

  protected prepareModuleName(details: Details) {
    if (!details.module) return null

    const { name, version } = details.module
    return version ? `${name}@${version}` : name
  }

  protected prepareLevel(meta: Meta) {
    return meta.level.toUpperCase()
  }

  protected prepareMessage(message: string, details: Details) {
    if (details.empty && !details.stacks.length && !details.errors.length) return message
    const messages = [message.trim()]

    if (!details.empty)
      messages.push(
        // ' ',
        formatWithOptions(
          {
            colors: this.colors,
            depth: details.depth !== undefined ? details.depth : this.depth,
          },
          details.details,
        ),
      )

    const stacktraces = this.prepareStacktraces(details)
    if (stacktraces) messages.push(stacktraces)

    return messages.join(' ')
  }

  protected prepareStacktraces(details: Details) {
    const stacktraces: string[] = []
    const add = (stack: string[], label?: string) => {
      if (label) stacktraces.push(label)
      stacktraces.push(...stack.map(str => `  ${str}`))
    }
    details.errors.filter(Boolean).forEach(error => add(error.stack, `${error.name}: ${error.message}`))
    details.stacks.filter(Boolean).forEach(stack => {
      if (Array.isArray(stack)) add(stack, stacktraces.length ? '==' : null)
      else add(stack.stack, stack.label)
    })
    if (stacktraces.length) return `\n${stacktraces.join(`\n`)}`
    return null
  }
}
