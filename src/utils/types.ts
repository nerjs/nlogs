import { ILogger } from '../helpers/types'
import { Details } from '../message/details'
import { Meta } from '../message/meta'

export enum Levels {
  error,
  warn,
  info,
  log,
  debug,
  trace,
}

export interface IFormatter {
  format(meta: Meta, details: Details, message: string): string
  messages(data: any[]): string
  time(pretty: string, label?: string): string
  error(name: string, message: string): string
  highlight(text: string): string

  symbol(value: symbol): string | symbol
  bigint(value: bigint): string | bigint
  date(value: Date): string | Date
  array(value: any[]): string | any[]
  null(value?: null | undefined): string | null | undefined
}

export type IOutLogger = Partial<ILogger> & Pick<ILogger, 'log'>
