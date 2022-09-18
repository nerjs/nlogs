import {
  ALLOWED,
  CATEGORY,
  DATETIME,
  DEPTH,
  HIGHLIGHT,
  INDEX,
  IS_MESSAGE,
  IS_META,
  LEVEL,
  META,
  PROJECT,
  SERVICE,
  STACKTRACE,
  TIME,
  TIMESTAMP,
  TRACE_ID,
} from './symbols'
import { AllowedSchema } from './types'

export class Base {
  static createBase(typeSymbol: symbol, key: symbol, value: any) {
    return {
      [typeSymbol]: true,
      [key]: value,
    }
  }

  static toMessage(key: symbol, value: any) {
    return this.createBase(IS_MESSAGE, key, value)
  }

  static toMeta(key: symbol, value: any) {
    return this.createBase(IS_META, key, value)
  }

  static isMessage(obj: object): boolean {
    return obj && !!obj[IS_MESSAGE]
  }

  static isMeta(obj: object): boolean {
    return obj && !!obj[IS_META]
  }

  static time(time: number) {
    return this.toMessage(TIME, time)
  }

  static highlight(text: string) {
    return this.toMessage(HIGHLIGHT, text)
  }

  static stacktrace(stack: string | string[]) {
    return this.toMessage(STACKTRACE, stack)
  }

  static datetime(date: Date) {
    return this.toMessage(DATETIME, date)
  }

  static project(name: string) {
    return this.toMeta(PROJECT, name)
  }

  static service(name: string) {
    return this.toMeta(SERVICE, name)
  }

  static category(name: string) {
    return this.toMeta(CATEGORY, name)
  }

  static level(level: string) {
    return this.toMeta(LEVEL, level)
  }

  static traceId(traceId: string) {
    return this.toMeta(TRACE_ID, traceId)
  }

  static timestamp(timestamp: Date) {
    return this.toMeta(TIMESTAMP, timestamp)
  }

  static depth(depth: number) {
    return this.toMeta(DEPTH, depth)
  }

  static index(index: string) {
    return this.toMeta(INDEX, index)
  }

  static meta(meta: Record<string, string | number>) {
    return this.toMeta(META, meta)
  }

  static allowed(allowed: boolean)
  static allowed(allowed: AllowedSchema)
  static allowed(allowed: keyof AllowedSchema, value: boolean)
  static allowed(allowed: boolean | keyof AllowedSchema | AllowedSchema, value?: boolean) {
    const sallowed: AllowedSchema = typeof allowed === 'object' ? { ...allowed } : {}
    if (typeof allowed === 'string') {
      sallowed[allowed] = !!value
    } else if (typeof allowed === 'boolean') {
      ;['console', 'file', 'elasticsearch'].forEach(key => (sallowed[key] = !!allowed))
    }

    return this.toMeta(ALLOWED, sallowed)
  }

  static show(value?: boolean) {
    if (value === undefined) return this.show(true)
    return this.allowed('console', value)
  }

  static write(value?: boolean) {
    if (value === undefined) return this.write(true)
    return this.allowed('file', value)
  }

  static send(value?: boolean) {
    if (value === undefined) return this.send(true)
    return this.allowed('elasticsearch', value)
  }
}
