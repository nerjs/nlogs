import { formatWithOptions } from 'util'
import { DEFAULT_JSON_MESSAGE_ITEMS_LIMIT } from '../constants'
import { LogInfo } from '../message/log.info'
import { IFormatter } from './types'

export class JsonFormatter implements IFormatter {
  readonly maxArrayLength: number = DEFAULT_JSON_MESSAGE_ITEMS_LIMIT

  symbol(value: symbol): string {
    return value.toString()
  }

  bigint(value: bigint): string {
    return `${value}n`
  }

  date(value: Date): string {
    return value.toJSON()
  }

  array(value: any[]): string {
    return value.toString()
  }
  // maxArrayLength caps Array entries but not Map/Set entries, so render
  // Array.from(...) to make the element limit actually apply to the message.
  map(value: Map<any, any>): string {
    return `Map(${value.size}) ${formatWithOptions({ maxArrayLength: this.maxArrayLength }, Array.from(value))}`
  }
  set(value: Set<any>): string {
    return `Set(${value.size}) ${formatWithOptions({ maxArrayLength: this.maxArrayLength }, Array.from(value))}`
  }
  null(value: null | undefined): string {
    return `${value}`
  }

  messages(data: any[]): string {
    return data.join(' ')
  }

  time(pretty: string, label?: string | null): string {
    return label ? `[${label}: ${pretty}]` : pretty
  }

  error(name: string, message: string): string {
    return `[${name}: ${message}]`
  }

  highlight(text: string): string {
    return `[${text}]`
  }

  format(info: LogInfo): string {
    return JSON.stringify(
      {
        message: info.message,
        meta: info.meta,
        details: info.details.toJSON(),
        '@timestamp': info.meta.timestamp,
        '@index': info.index,
      },
      JsonFormatter.replacer,
    )
  }

  // JSON.stringify renders Map/Set as {}. Convert any that reach details
  // nested inside objects; top-level args already arrive as arrays in _maps/_sets.
  private static replacer(_key: string, value: any) {
    if (value instanceof Map) return Array.from(value)
    if (value instanceof Set) return Array.from(value)
    return value
  }
}
