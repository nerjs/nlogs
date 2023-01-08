import { Details } from '../message/details'
import { Meta } from '../message/meta'
import { IFormatter } from './types'

export class JsonFormatter implements IFormatter {
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
  null(value: null | undefined): string {
    return `${value}`
  }

  messages(data: any[]): string {
    return data.join(' ')
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
    return JSON.stringify({
      message,
      meta,
      details: details.toJSON(),
      '@timestamp': meta.timestamp,
      '@index': meta.index,
    })
  }
}
