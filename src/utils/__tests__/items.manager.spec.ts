import { clearMocks, testLogger } from '../../helpers/testHelpers'
import { ItemManagerOptions, ItemMsg, ItemResult, ItemsManager, LogItem, LogType } from '../items.manager'

describe('items manager', () => {
  class Items extends ItemsManager<string, ItemManagerOptions> {
    name: 'items'
    defaultData = 'qwerty'
    itemCallback = jest.fn<ItemResult<string> | ItemResult<string>[], [ItemMsg<string>]>(msg => ({ messages: [msg] }))
  }

  const options: ItemManagerOptions = {
    checkCacheTimeout: 1000,
    maxCacheTime: 10000,
    maxCacheSize: 10,
  }

  let items: Items
  beforeEach(() => {
    if (items) items.clear()
    clearMocks()
    items = new Items(testLogger, options)
  })

  beforeAll(() => {
    jest.useFakeTimers()
  })

  it('zero size items', () => {
    expect(items.size).toEqual(0)
    expect(() => items.get('label')).toThrow()
  })

  describe('call start method', () => {
    it('start with label', () => {
      const label = 'qwerty'
      const item = items.start(label)

      expect(items.size).toEqual(1)
      expect(items.has(label)).toBeTruthy()
      expect(item.label).toEqual(label)
    })

    it('start without label', () => {
      const item = items.start()

      expect(items.has(item.id)).toBeTruthy()
      expect(item.label).not.toBeDefined()
    })

    it('start call', () => {
      items.start()
      expect(items.itemCallback).toHaveBeenCalled()
      expect(items.itemCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: LogType.START,
          data: items.defaultData,
        }),
      )
    })

    it('start with duplicate label', () => {
      const label = 'qwerty'

      const fitem = items.start(label)
      expect(items.get(label)).toEqual(fitem)

      const sitem = items.start(label)
      expect(fitem).not.toEqual(sitem)
      expect(items.get(label)).toEqual(sitem)
    })

    it('Calling start when the previous duplicate is incomplete', () => {
      items.start('qwerty')
      items.start('qwerty')
      expect(items.itemCallback).toHaveBeenNthCalledWith(2, expect.objectContaining({ type: LogType.END }))
    })

    it('Calling start when the previous duplicate is complete', () => {
      items = new Items(testLogger, {
        ...options,
        checkCacheTimeout: options.maxCacheTime * 2,
      })
      items.start('qwerty')
      jest.advanceTimersByTime(options.maxCacheTime)
      items.start('qwerty')
      expect(items.itemCallback).not.toHaveBeenNthCalledWith(2, expect.objectContaining({ type: LogType.END }))
    })

    it('recomended limit', () => {
      for (let i = 0; i < options.maxCacheSize + 1; i++) items.start()

      expect(testLogger.warn).toHaveBeenCalled()
      expect(testLogger.warn).toHaveBeenCalledWith(expect.stringMatching('limit'))
    })
  })

  describe('call log method', () => {
    it('empty label', () => {
      items.log('')
      expect(testLogger.warn).toHaveBeenCalledWith(expect.stringMatching('empty'))
    })

    it('A non-existent element', () => {
      items.log('qwerty')
      expect(testLogger.warn).toHaveBeenCalledWith(expect.stringMatching('not found'))
    })

    it('call existent', () => {
      const label = 'qwerty'
      items.start(label)
      items.log(label)
      expect(items.itemCallback).toHaveBeenCalledWith(expect.objectContaining({ type: LogType.LOG }))
    })
  })

  describe('call end method', () => {
    it('empty label', () => {
      items.end('')
      expect(testLogger.warn).toHaveBeenCalledWith(expect.stringMatching('empty'))
    })

    it('A non-existent element', () => {
      items.end('qwerty')
      expect(testLogger.warn).toHaveBeenCalledWith(expect.stringMatching('not found'))
    })

    it('call existent', () => {
      const label = 'qwerty'
      items.start(label)
      items.end(label)
      expect(items.itemCallback).toHaveBeenCalledWith(expect.objectContaining({ type: LogType.END }))
    })
  })

  describe('calls log message', () => {
    let item: LogItem<string>

    beforeEach(() => {
      item = items.start()
      items.itemCallback.mockClear()
      clearMocks()
    })

    it('call log with args', () => {
      const args = [1, 'qwerty']
      item.log(...args)
      expect(items.itemCallback).toHaveBeenCalledWith(
        expect.objectContaining({ type: LogType.LOG, messages: expect.arrayContaining(args) }),
      )
    })

    it('call end with args', () => {
      const args = [1, 'qwerty']
      item.end(...args)
      expect(items.itemCallback).toHaveBeenCalledWith(
        expect.objectContaining({ type: LogType.END, messages: expect.arrayContaining(args) }),
      )
    })

    it('call main fn', () => {
      item()
      expect(items.itemCallback).toHaveBeenCalledWith(expect.objectContaining({ type: LogType.END }))
    })

    it('expired items', () => {
      jest.advanceTimersByTime(options.maxCacheTime)
      item.log()
      item.end()
      expect(items.itemCallback).not.toHaveBeenCalled()
    })

    it('removed items', () => {
      item.end()
      items.itemCallback.mockReset()
      item.log()
      expect(items.itemCallback).not.toHaveBeenCalled()
    })

    it('return new data from callback', () => {
      const ndata = 'new Data'
      items.itemCallback.mockImplementation(() => ({ data: ndata }))
      item.log()
      expect(items.itemCallback).toHaveBeenLastCalledWith(expect.objectContaining({ data: items.defaultData }))
      item.log()
      expect(items.itemCallback).toHaveBeenLastCalledWith(expect.objectContaining({ data: ndata }))
    })

    it('missing result', () => {
      // @ts-ignore
      items.itemCallback.mockImplementation(() => undefined)
      item.log()
      expect(testLogger.debug).not.toHaveBeenCalled()
    })

    it('missing result messages', () => {
      items.itemCallback.mockImplementation(() => ({}))
      item.log()
      expect(testLogger.debug).not.toHaveBeenCalled()
    })

    describe('levels', () => {
      const levels = ['log', 'trace', 'debug', 'info', 'warn', 'error']

      for (const level of levels) {
        it(`level (${level}) result messages`, () => {
          items.itemCallback.mockImplementation(() => ({ level: level as any, messages: ['any'] }))
          item()
          expect(testLogger[level]).toHaveBeenCalled()
        })
      }
    })

    it('warning if throw callback', () => {
      items.itemCallback.mockImplementation(() => {
        throw new Error('test')
      })
      item()
      expect(testLogger.error).toHaveBeenCalledWith(expect.stringMatching('Error'), expect.any(Error))
    })

    it('More than one result', () => {
      items.itemCallback.mockImplementation(() => [
        {
          messages: ['first'],
        },
        {
          messages: ['second'],
        },
      ])
      item.log()
      expect(testLogger.debug).toHaveBeenCalledTimes(2)
    })

    it('auto remove item', () => {
      jest.advanceTimersByTime(options.maxCacheTime)
      expect(testLogger.warn).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`deleted|${item.id}`, 'g')))
    })

    it('auto remove item with label', () => {
      item.label = 'label'
      jest.advanceTimersByTime(options.maxCacheTime)
      expect(testLogger.warn).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`deleted|${item.label}`, 'g')))
    })
  })
})
