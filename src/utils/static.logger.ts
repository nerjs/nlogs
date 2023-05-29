import { Mod } from './mod'
import { stackToArray } from '../helpers/stack'
import {
  CATEGORY,
  DEPTH,
  DETAILS,
  EMPTY,
  HIDDEN_DETAILS,
  HIGHLIGHT,
  INDEX,
  INTERPOLATE,
  LEVEL,
  MODULE,
  PROJECT,
  SERVICE,
  SHOW,
  STACKTRACE,
  TIME,
  TIMERANGE,
  TIMESTAMP,
  toMetaInfo,
  TRACE_ID,
} from '../helpers/symbols'
import { MetaInfo } from '../helpers/types'
import { ModDetails } from '../message/mod.details'
import { TimeDetails } from '../message/time.details'
import { TimeRange } from '../message/time.range'
import { prettyArray, prettyList, prettyValue } from '../helpers/string'

export class StaticLogger {
  static toMetaInfo(key: symbol, value: any) {
    return toMetaInfo(key, value)
  }

  // messages
  static time(ms: number, label?: string) {
    return this.toMetaInfo(TIME, new TimeDetails(ms, label))
  }

  static highlight(text: string) {
    return this.toMetaInfo(HIGHLIGHT, text)
  }

  static stacktrace(stack: string | string[], label?: string) {
    return this.toMetaInfo(STACKTRACE, { stack: stackToArray(stack), label })
  }

  // details
  static details(obj: Record<string, any>) {
    return this.toMetaInfo(DETAILS, obj)
  }

  static hiddenDetails(obj: Record<string, any>) {
    return this.toMetaInfo(HIDDEN_DETAILS, obj)
  }

  static noConsole(obj: Record<string, any>) {
    return this.hiddenDetails(obj)
  }

  static depth(depth: number) {
    return this.toMetaInfo(DEPTH, depth)
  }

  static timeRange(from: number | Date, to?: number | Date): MetaInfo
  static timeRange(from: number | Date, label?: string): MetaInfo
  static timeRange(from: number | Date, to: number | Date, label?: string): MetaInfo
  static timeRange(from: number | Date, toOrLabel?: number | Date | string, label?: string) {
    return this.toMetaInfo(
      TIMERANGE,
      new TimeRange(from, typeof toOrLabel !== 'string' ? toOrLabel : undefined, typeof toOrLabel === 'string' ? toOrLabel : label),
    )
  }

  // meta

  static module(module: ModDetails | Mod)
  static module(module: string, version?: string)
  static module(module: string | ModDetails, version?: string) {
    if (typeof module === 'string') return this.module(new ModDetails(module, version))
    return this.toMetaInfo(MODULE, module)
  }

  static project(project: string) {
    return this.toMetaInfo(PROJECT, project)
  }
  static service(service: string) {
    return this.toMetaInfo(SERVICE, service)
  }
  static category(category: string) {
    return this.toMetaInfo(CATEGORY, category)
  }
  static level(level: string) {
    return this.toMetaInfo(LEVEL, level)
  }
  static traceId(traceId: string) {
    return this.toMetaInfo(TRACE_ID, traceId)
  }
  static index(index: string) {
    return this.toMetaInfo(INDEX, index)
  }
  static timestamp(timestamp: Date) {
    return this.toMetaInfo(TIMESTAMP, timestamp)
  }

  static show(value?: boolean) {
    return this.toMetaInfo(SHOW, value === undefined || !!value)
  }

  static interpolate(data: any[]) {
    return this.toMetaInfo(INTERPOLATE, data)
  }

  static pretty(value: any, wrap?: boolean) {
    return prettyValue(value, wrap)
  }

  static prettyArray(arr: any[], wrap?: boolean, wrapItem?: boolean) {
    return prettyArray(arr, wrap, wrapItem)
  }

  static prettyList(list: any | any[], wrap?: boolean, wrapItem?: boolean) {
    return prettyList(list, wrap, wrapItem)
  }

  static empty() {
    return this.toMetaInfo(EMPTY, true)
  }
}
