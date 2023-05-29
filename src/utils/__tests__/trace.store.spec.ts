import { ParamNlogsError } from '../../errors/param.error'
import { TraceStore } from '../trace.store'

describe('trace store', () => {
  let store: TraceStore

  beforeEach(async () => {
    store?.exit()
    store = new TraceStore()
  })

  describe('check trace ID(s)', () => {
    it('the root traceId is always available', () => {
      expect(store.rootTraceId).toEqual(expect.any(String))
    })

    it('The current traceId is always available', () => {
      expect(store.traceId).toEqual(expect.any(String))
    })

    it('At the first level traceId is equal to the root', () => {
      expect(store.traceId).toEqual(store.rootTraceId)
    })

    it('There is no traceId list on the first level', () => {
      expect(store.traceIds).not.toBeDefined()
    })

    it('At the second level, the traceIds list includes only the root traceId', () => {
      store.run(() => {
        expect(store.traceIds).toEqual(expect.any(Array))

        const traceIds = store.traceIds

        expect(traceIds.length).toEqual(1)
        expect(traceIds[0]).toEqual(store.rootTraceId)
      })
    })

    it('You can override traceId by assigning', () => {
      const nextTraceId = 'custom string'
      const checkTraceId = () => expect(store.traceId).toEqual(nextTraceId)

      store.run(() => {
        store.traceId = nextTraceId
        checkTraceId()
      })
    })

    it('At all subsequent levels the previous traceId is added to the list of traceIds', () => {
      store.run(() => {
        const { traceId: tid1, traceIds: tids1 } = store
        store.run(() => {
          const { traceId: tid2, traceIds: tids2 } = store
          expect(tids2.length).toEqual(tids1.length + 1)
          expect(tids2).toEqual([...tids1, tid1])

          store.run(() => {
            const { traceId: tid3, traceIds: tids3 } = store
            expect(tids3.length).toEqual(tids2.length + 1)
            expect(tids3).toEqual([...tids2, tid2])

            store.run(() => {
              const { traceIds: tids4 } = store
              expect(tids4.length).toEqual(tids3.length + 1)
              expect(tids4).toEqual([...tids3, tid3])
            })
          })
        })
      })
    })
  })

  describe('check session ID', () => {
    it('By default sessionId is not defined', () => {
      expect(store.sessionId).not.toBeDefined()
    })

    it('You can override sessionId by assigning', () => {
      const nextSessionId = 'custom string'
      const checkSessionId = () => expect(store.sessionId).toEqual(nextSessionId)

      store.sessionId = nextSessionId
      checkSessionId()
      store.run(checkSessionId)
    })
  })

  describe('details update', () => {
    it('By default, the details are an empty object', () => {
      expect(store.details).toBeDefined()
      expect(store.details).toEqual({})
    })

    it('Overriding details with method setDetails()', () => {
      const first = { field1: 'value 1' }
      const second = { field2: 'value 2' }

      store.setDetails(first)
      expect(store.details).toEqual(first)

      store.setDetails(second)
      expect(store.details).toEqual(second)
    })

    it('Merge details with method mergeDetails()', () => {
      const first = { field1: 'value 1' }
      const second = { field2: 'value 2' }

      store.setDetails(first)
      expect(store.details).toEqual(first)

      store.mergeDetails(second)
      expect(store.details).toEqual({ ...first, ...second })
    })
  })

  describe('run trace', () => {
    it('value returned by the callback', () => {
      const store = new TraceStore()
      const result = 'qwerty'
      expect(store.run(() => result)).toEqual(result)
    })

    it('Calling the run(callback) method without additional arguments', () => {
      const store = new TraceStore()
      const first = store.traceId

      store.run(() => {
        expect(store.traceId).toBeDefined()
        expect(store.traceId).not.toEqual(first)
      })
    })

    it('Passing traceId to run(callback) method by string', () => {
      const traceId = 'some trace id'
      store.run(traceId, () => {
        expect(store.traceId).toEqual(traceId)
      })
    })

    it('Passing traceId to the run(callback) method as an object', () => {
      const traceId = 'some trace id'
      store.run({ traceId }, () => {
        expect(store.traceId).toEqual(traceId)
      })
    })

    it('Passing sessionId to the run(callback) method as an object', () => {
      const sessionId = 'some session id'
      store.run({ sessionId }, () => {
        expect(store.sessionId).toEqual(sessionId)
      })
    })

    it('Passing details to the run(callback) method as an object', () => {
      const details = { field1: 'value 1', field2: 'value 2' }
      store.run(details, () => {
        expect(store.details).toEqual(details)
      })
    })

    it('Passing details to the run(callback) method as an field details', () => {
      const details = { field1: 'value 1', field2: 'value 2' }
      store.run({ details }, () => {
        expect(store.details).toEqual(details)
      })
    })

    it('Error in run() method when there is no callback', () => {
      // @ts-ignore
      expect(() => store.run('some value')).toThrow(ParamNlogsError)
    })

    it('The logic of nested run(callback) method calls', () => {
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

      expect(store.details).toBeDefined()
      expect(store.details).toEqual({})
      expect(store.traceId).toEqual(first)
    })
  })
})
