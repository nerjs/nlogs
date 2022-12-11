import { Info } from '../message/info'

export interface ILogger {
  log(...msgs: any[]): void
  debug?(...msgs: any[]): void
  info?(...msgs: any[]): void
  warn?(...msgs: any[]): void
  error(...msgs: any[]): void
}

export enum Levels {
  error,
  warn,
  info,
  log,
  debug,
  trace,
}

export type MaybePromise<T> = T | PromiseLike<T>

export interface IFormatter {
  format(info: Info): any[]
}

export type IOutLogger = Partial<ILogger> & Pick<ILogger, 'log'>
