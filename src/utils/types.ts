import { LogInfo } from '../message/log.info'

export interface IFormatter {
  format(info: LogInfo): string
  messages(data: any[], info: LogInfo): string
  time(pretty: string, label: string | null, info: LogInfo): string
  error(name: string, message: string, info: LogInfo): string
  highlight(text: string, info: LogInfo): string

  symbol(value: symbol, info: LogInfo): string | symbol
  bigint(value: bigint, info: LogInfo): string | bigint
  date(value: Date, info: LogInfo): string | Date
  array(value: any[], info: LogInfo): string | any[]
  null(value: null | undefined, info: LogInfo): string | null | undefined
}

export interface IOutLogger {
  out(str: string): void
  error(str: string): void
}
