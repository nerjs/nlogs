import { clearMocks, stringLogFn, testLogger } from '../../helpers/testHelpers'
import { ItemCounterOptions, ItemsCounters } from '../items.counter'

describe('items counters', () => {
  const options: ItemCounterOptions = {
    checkCacheTimeout: 1000,
    maxCacheTime: 10000,
    maxCacheSize: 10,
  }

  const counters = new ItemsCounters(testLogger, options)

  beforeEach(() => {
    counters.clear()
    clearMocks()
  })

  it('increment counter', () => {
    const counter = counters.start()
    counter.log()
    counter.log()
    counter.log()
    counter.log()
    counter.end()

    expect(stringLogFn).toHaveBeenNthCalledWith(1, expect.stringMatching('1'))
    expect(stringLogFn).toHaveBeenNthCalledWith(2, expect.stringMatching('2'))
    expect(stringLogFn).toHaveBeenNthCalledWith(3, expect.stringMatching('3'))
    expect(stringLogFn).toHaveBeenNthCalledWith(4, expect.stringMatching('4'))
    expect(stringLogFn).toHaveBeenNthCalledWith(5, expect.stringMatching('5'))
    expect(stringLogFn).toHaveBeenNthCalledWith(6, expect.stringMatching('6'))
  })

  it('counter log with arguments', () => {
    const counter = counters.start()
    counter.log('qwerty')
    expect(stringLogFn).toHaveBeenNthCalledWith(2, expect.stringMatching('qwerty'))
  })

  it('counter log with label', () => {
    counters.start('label')
    expect(stringLogFn).toHaveBeenCalledWith(expect.stringMatching('label'))
  })
})
