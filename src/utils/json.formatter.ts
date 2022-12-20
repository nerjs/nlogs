import { ErrorDetails } from '../message/error.details'
import { HighlightMessage } from '../message/highlight.message'
import { MessageInfo } from '../message/message.info'
import { TimeDetails } from '../message/time.details'
import { IFormatter } from './types'

export class JsonFormatter implements IFormatter {
  format(info: MessageInfo): any[] {
    const messages = info.messages.map(data => {
      if (typeof data === 'symbol') return data.toString()
      if (!data || typeof data !== 'object') return `${data}`
      if (data instanceof ErrorDetails) return data.toString()
      if (data instanceof TimeDetails) return `[${data.label ? `${data.label}: ` : ''}${data.pretty}]`
      if (data instanceof HighlightMessage) return `[${data.text}]`
      if (Array.isArray(data)) return `[${data.join(', ')}]`
      return JSON.stringify(data)
    })

    return [
      JSON.stringify({
        meta: info.meta,
        message: messages.join(' '),
        details: info.details.toJSON(),
        '@timestamp': info.timestamp,
        '@index': info.meta.index,
      }),
    ]
  }
}
