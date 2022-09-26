export interface ILogger {
  log(...msgs: any[]): void
  debug(...msgs: any[]): void
  info(...msgs: any[]): void
  warn(...msgs: any[]): void
  error(...msgs: any[]): void
}

export interface AllowedSchema {
  console?: boolean
  file?: boolean
  elasticsearch?: boolean
}

export type LogTime = {
  (...msgs: any[]): LogTime
  log(...msgs: any[]): LogTime
  end(...msgs: any[]): LogTime
}

export interface StoreDetails extends Record<string, any> {}

export type LocalStore<T extends StoreDetails = any> = {
  traceId: string
  details?: T
}

export type PromiseLike<T = any> = T | Promise<T>

export type Meta = {
  project: string
  service: string
  category: string
  level: string
  traceId: string
  timestamp: Date

  [key: string]: any
}

export interface ElMsg<D extends object = object> {
  message: string
  meta: Meta
  details: D
}

export interface ElMessage<D extends object = object> extends ElMsg<D> {
  ['@timestamp']: Date
}

export type OutElMessage = Pick<ElMessage, 'message' | 'meta'> & Partial<Pick<ElMessage, 'details'>>
