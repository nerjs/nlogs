import { AsyncLocalStorage } from 'async_hooks'
import { uuid } from '../helpers/string'
import { MaybePromise } from '../helpers/types'
import { ParamNlogsError } from '../errors/param.error'

export interface TraceState<T extends object> {
  traceId: string
  sessionId?: string
  parentTrace?: TraceState<T>
  details?: T
}

export interface WithTraceId {
  traceId?: string
  sessionId?: string
  details?: any
  [key: string]: any
}

export class TraceStore<T extends object = object> {
  readonly storage = new AsyncLocalStorage<TraceState<T>>()
  readonly rootTraceId = uuid()

  get store(): TraceState<T> {
    return this.storage.getStore() || { traceId: this.rootTraceId }
  }

  get traceId() {
    return this.store?.traceId
  }

  set traceId(value: string) {
    this.assign({ traceId: value })
  }

  get sessionId() {
    return this.store?.sessionId
  }

  set sessionId(value: string) {
    this.assign({ sessionId: value })
  }

  get traceIds(): string[] | undefined {
    if (!this.store.parentTrace) return undefined
    let state = this.store
    const ids = new Set<string>()

    while (state.parentTrace) {
      state = state.parentTrace
      ids.add(state.traceId)
    }

    // ids.delete(this.rootTraceId)

    return [...ids].reverse()
  }

  get details() {
    return this.store.details || {}
  }

  assign(state: Partial<TraceState<T>>) {
    this.storage.enterWith(Object.assign({}, this.storage.getStore(), state))
  }

  setDetails(details: T) {
    this.assign({ details })
  }

  mergeDetails(details: T) {
    this.assign({ details: Object.assign({}, this.details, details) })
  }

  run<R extends MaybePromise<any>>(callback: () => R): R
  run<R extends MaybePromise<any>>(traceId: string, callback: () => R): R
  run<R extends MaybePromise<any>, D extends WithTraceId>(details: D, callback: () => R): R
  run<R extends MaybePromise<any>, D extends WithTraceId>(tdc: (() => R) | string | D, callback?: () => R): R {
    if (typeof tdc === 'function') return this.run({}, tdc)
    if (typeof callback !== 'function') throw new ParamNlogsError('TraceStore.run', 'callback')
    if (typeof tdc === 'string') return this.run({ traceId: tdc }, callback)

    const { traceId, sessionId, details, ...stateDetails } = tdc

    const state: TraceState<T> = {
      ...this.store,
      traceId: traceId || uuid(),
      sessionId: sessionId || this.sessionId,
      details: {
        ...this.details,
        ...stateDetails,
        ...(details || {}),
      },
    }

    state.parentTrace = this.store
    return this.storage.run(state, callback)
  }

  async exit() {
    return new Promise<void>(resolve => this.storage.exit(resolve))
  }
}
