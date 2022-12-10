import 'colors'
import { Transport } from './Transport'
import type { ConsoleConfig } from '../config/types'
import { Parser } from './Parser'
import { padTimeItem } from '../helpers/string'
import { Base } from './Base'
import { DATETIME, HIGHLIGHT, STACKTRACE, TIME } from './symbols'
import prettyTime from 'pretty-time'
import { formatWithOptions } from 'util'

export const COLORS = {
  debug: 'magenta',
  info: 'green',
  warn: 'yellow',
  error: 'red',
  fatal: 'red',
}

export class ConsoleTransport extends Transport<ConsoleConfig> {
  private getLevelColored(parser) {
    const color = COLORS[parser.level.toLowerCase()]
    const level = parser.level
    if (!color) return level
    return level[color]
  }

  private getShortTime(time: Date): string {
    const h = padTimeItem(time.getHours(), 'h')
    const m = padTimeItem(time.getMinutes(), 'm')
    const s = padTimeItem(time.getSeconds(), 's')
    const ms = padTimeItem(time.getMilliseconds(), 'ms')

    return `..${h}:${m}:${s}.${ms}`.grey.bgBlack
  }

  private parseToFull(parser: Parser): string {
    const traces = []
    const messages = parser.messages
      .filter(msg => {
        if (!Base.isMessage(msg) || !msg[STACKTRACE]) return true
        traces.push(msg[STACKTRACE])
        return false
      })
      .map(msg => {
        if (!Base.isMessage(msg)) return msg

        if (msg[HIGHLIGHT]) return `${msg[HIGHLIGHT]}`.bold
        if (msg[DATETIME]) {
          if (msg[DATETIME] instanceof Date) {
            if (isNaN(msg[DATETIME].getTime())) return msg[DATETIME]
            return msg[DATETIME].toLocaleString().replace(' ', '').magenta
          } else {
            return 'Invalid date'.magenta
          }
        }
        if (msg[TIME] !== undefined) return prettyTime(1000000 * msg[TIME], 'ms').yellow

        return ''
      })

    if (parser.details) messages.push(parser.details)

    if (traces.length) {
      messages.push('\n')
      messages.push(
        traces
          .map(tr => tr.join('\n\t'))
          .map(s => `${s}`.trimStart())
          .join('\n'),
      )
    }

    return formatWithOptions(
      {
        colors: true,
        depth: parser.depth,
      },
      this.getShortTime(parser.timestamp),
      '['.gray,
      parser.meta.category.cyan.italic,
      this.getLevelColored(parser),
      ']:'.gray,
      ...messages,
    )
  }

  private parseToSimple(parser: Parser): string {
    return ConsoleTransport.toTextLine(parser, false)
  }

  private parseToJson(parser: Parser): string {
    return ConsoleTransport.toJsonLine(parser, false)
  }

  logTo(parser: Parser): boolean {
    const { format } = this.config.config
    const message = format === 'full' ? this.parseToFull(parser) : format === 'json' ? this.parseToJson(parser) : this.parseToSimple(parser)
    const method = ['error', 'warn', 'fatal'].includes(parser.level.toLowerCase()) ? 'error' : 'log'
    console[method](message)
    return true
  }
  count(): number {
    return 0
  }
}
