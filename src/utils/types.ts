import { Mod } from '../helpers/mod'
import { ILogger } from '../helpers/types'
import { MessageInfo } from '../message/message.info'

export enum Levels {
  error,
  warn,
  info,
  log,
  debug,
  trace,
}

export interface IFormatter {
  format(info: MessageInfo, mod: Mod): string
}

export type IOutLogger = Partial<ILogger> & Pick<ILogger, 'log'>
