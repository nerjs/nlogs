import type { Message } from './Message'

export const HIGHLIGHT = Symbol('Highlight text')
export const TIME = Symbol('Time')

export interface ITextFormats {
  sep(msg: Message): string
  text(text: string, msg: Message): string
  time(time: number, msg: Message): string
  highlight(text: string, msg: Message): string
  string(value: any, msg: Message): string
  join(data: string[], msg: Message): string
}

export interface TextFormat extends ITextFormats {}
export class TextFormat {
  constructor(format?: Partial<ITextFormats>) {
    Object.assign(this, format)
  }

  format(msg: Message, ...data: any[]) {
    const sep = this.sep(msg)
    // const array = data.map()
  }
}

export interface FormatFns {
  sep(msg: Message): string
  prefix(pr: { project: string; service?: string; category: string; traceId: string }, msg: Message): string
  level(lvl: { level: string; sublevel?: string }, msg: Message): string
  timestamp(timestamp: number, msg: Message): string
  text(value: any, msg: Message): string
  time(time: number, msg: Message): string
  highlight(value: any, msg: Message): string
  details(obj: object, msg: Message): string
}

export interface Format extends FormatFns {}
export class Format {
  constructor(def: Partial<FormatFns>, cur?: Partial<FormatFns>) {
    Object.assign(this, def, cur)
  }
}
