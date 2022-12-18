import { AsyncLocalStorage } from 'async_hooks'
import { uuid } from '../helpers/string'
import { MaybePromise } from '../helpers/types'

export interface TraceState<T extends object> {
  traceId: string
  parentTrace?: TraceState<T>
  details?: T
}

export class TraceStore<T extends object = object> {
  private readonly storage = new AsyncLocalStorage<TraceState<T>>()

  constructor() {
    this.storage.enterWith({ traceId: uuid() })
  }

  get store() {
    return this.storage.getStore()
  }

  get traceId() {
    return this.store.traceId
  }

  get traceIds(): string[] | undefined {
    if (!this.store.parentTrace) return undefined
    let state = this.store
    const ids: string[] = []

    while (state.parentTrace) {
      state = state.parentTrace
      ids.unshift(state.traceId)
    }

    return ids
  }

  get details() {
    return this.store.details
  }

  setDetails(details: T) {
    this.storage.enterWith(Object.assign({}, this.store, { details }))
  }

  mergeDetails(details: T) {
    this.setDetails(Object.assign({}, this.details, details))
  }

  run<R extends MaybePromise<any>>(callback: () => R): R {
    const state: TraceState<T> = {
      ...this.store,
      traceId: uuid(),
    }

    if (this.store) state.parentTrace = this.store

    return this.storage.run(state, callback)
  }
}
