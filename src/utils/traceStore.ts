import { AsyncLocalStorage } from 'async_hooks'
import { v4 as uuid } from 'uuid'
import { LocalStore, MaybePromise } from './types'

export default {
  storage: new AsyncLocalStorage<LocalStore>(),

  get store() {
    return Object.assign({}, this.storage.getStore())
  },

  get traceId() {
    return this.store.traceId || uuid()
  },

  get meta() {
    return this.store.meta || {}
  },

  get details() {
    return this.store.details
  },

  setMeta(meta: LocalStore['meta']) {
    this.storage.getStore().meta = meta
  },

  setDetails(details: LocalStore['details']) {
    this.storage.getStore().details = details
  },

  setTraceId(traceId: LocalStore['traceId']) {
    this.storage.getStore().traceId = traceId
  },

  run<R extends MaybePromise<any>>(store: Partial<LocalStore>, callback: () => R): R {
    const currentStore: LocalStore = { traceId: uuid(), ...store }

    if (this.details) {
      if (!currentStore.details) currentStore.details = {}
      Object.assign(this.details, currentStore.details)
    }

    currentStore.meta = Object.assign({}, this.meta, currentStore.meta)

    return this.storage.run(currentStore, callback)
  },
}
