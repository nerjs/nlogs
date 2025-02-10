export interface ILogger {
  log(...msgs: any[]): void
  debug(...msgs: any[]): void
  trace?(...msgs: any[]): void
  info(...msgs: any[]): void
  warn(...msgs: any[]): void
  error(...msgs: any[]): void
}

export type MaybePromise<T> = T | PromiseLike<T>

export type SomeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

export type MetaInfo = Record<symbol, any>
