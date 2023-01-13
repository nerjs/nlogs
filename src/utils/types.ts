import { ILogger } from '../helpers/types'
import { LogInfo } from '../message/log.info'

export enum Levels {
  error,
  warn,
  info,
  log,
  debug,
  trace,
}

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

export type IOutLogger = Partial<ILogger> & Pick<ILogger, 'log'>
