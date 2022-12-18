import { TraceStore } from '../trace.store'

describe('trace store', () => {
  //   let store: TraceStore

  //   beforeEach(() => {
  //     store = new TraceStore()
  //   })

  it('start trace ID', () => {
    const store = new TraceStore()
    expect(store.traceId).toEqual(expect.any(String))
    expect(store.traceIds).not.toBeDefined()
  })

  it('set trace details', () => {
    const store = new TraceStore()
    expect(store.details).not.toBeDefined()
    store.setDetails({ field1: 'qwerty' })
    expect(store.details).toEqual({ field1: 'qwerty' })
    store.setDetails({ field2: 'qwerty' })
    expect(store.details).toEqual({ field2: 'qwerty' })
  })

  it('merge trace details', () => {
    const store = new TraceStore()
    expect(store.details).not.toBeDefined()
    store.setDetails({ field1: 'qwerty' })
    expect(store.details).toEqual({ field1: 'qwerty' })
    store.mergeDetails({ field2: 'qwerty' })
    expect(store.details).toEqual({ field1: 'qwerty', field2: 'qwerty' })
  })

  it('return run callback', () => {
    const store = new TraceStore()
    const result = 'qwerty'
    expect(store.run(() => result)).toEqual(result)
  })

  it('run trace callbacks', () => {
    const store = new TraceStore()
    const first = store.traceId

    store.run(() => {
      const firstDetails = { field: 'qwerty' }
      store.setDetails(firstDetails)
      const second = store.traceId
      expect(second).not.toEqual(first)
      expect(store.traceIds).toEqual(expect.arrayContaining([first]))

      store.run(() => {
        const secondDetails = { field2: 'qwerty' }
        store.setDetails(secondDetails)

        expect(store.traceId).not.toEqual(second)
        expect(store.details).not.toEqual(firstDetails)
        expect(store.details).toEqual(secondDetails)
        expect(store.traceIds).toEqual(expect.arrayContaining([first, second]))
      })

      store.run(() => {
        const secondDetails = { field3: 'qwerty' }
        store.mergeDetails(secondDetails)

        expect(store.traceId).not.toEqual(second)
        expect(store.details).toEqual({
          ...firstDetails,
          ...secondDetails,
        })
        expect(store.traceIds).toEqual(expect.arrayContaining([first, second]))
      })

      expect(store.traceId).toEqual(second)
      expect(store.details).toEqual(firstDetails)
    })

    expect(store.details).not.toBeDefined()
    expect(store.traceId).toEqual(first)
  })
})
