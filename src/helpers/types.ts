export interface ILogger {
  log(...msgs: any[]): void
  debug(...msgs: any[]): void
  info(...msgs: any[]): void
  warn(...msgs: any[]): void
  error(...msgs: any[]): void
}

export type MaybePromise<T> = T | PromiseLike<T>

export type MetaInfo = {
  [key: symbol]: any
}
