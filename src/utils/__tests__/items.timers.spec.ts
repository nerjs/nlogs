import { clearMocks, stringLogFn, testLogger } from '../../helpers/testHelpers'
import { ItemsTimers, ItemTimerOptions } from '../items.timer'

describe('Items timers', () => {
  const options: ItemTimerOptions = {
    checkCacheTimeout: 1000,
    maxCacheTime: 10000,
    maxCacheSize: 10,
    logOnStart: false,
  }

  const timers = new ItemsTimers(testLogger, options)
  beforeEach(() => {
    if (timers) timers.clear()
    clearMocks()
  })

  beforeAll(() => {
    jest.useFakeTimers()
  })

  it('call start log without label', () => {
    const stimers = new ItemsTimers(testLogger, { ...options, logOnStart: true })
    stimers.start()
    expect(stringLogFn).toHaveBeenCalledWith(expect.stringMatching('timeStart'))
  })

  it('call start log with label', () => {
    const label = 'qwerty'
    const stimers = new ItemsTimers(testLogger, { ...options, logOnStart: true })
    stimers.start(label)
    expect(stringLogFn).toHaveReturnedWith(expect.stringMatching(label))
  })

  it('not called start log', () => {
    timers.start()
    expect(stringLogFn).not.toHaveBeenCalled()
  })

  it('call log method', () => {
    const timer = timers.start()
    const ms = 123
    jest.advanceTimersByTime(ms)
    timer.log()
    expect(stringLogFn).toHaveReturnedWith(expect.stringMatching('timeLog'))
    expect(stringLogFn).toHaveReturnedWith(expect.stringMatching(`${ms}`))
  })

  it('call end method', () => {
    const timer = timers.start()
    const ms = 123
    jest.advanceTimersByTime(ms)
    timer.end()
    expect(stringLogFn).toHaveReturnedWith(expect.stringMatching('timeEnd'))
    expect(stringLogFn).toHaveReturnedWith(expect.stringMatching(`${ms}`))
  })

  it('call log method with label', () => {
    const label = 'qwerty'
    const timer = timers.start(label)
    timer.log()
    expect(stringLogFn).toHaveReturnedWith(expect.stringMatching(label))
  })

  it('call end method with label', () => {
    const label = 'qwerty'
    const timer = timers.start(label)
    timer.end()
    expect(stringLogFn).toHaveReturnedWith(expect.stringMatching(label))
  })

  it('call log method with arguments', () => {
    const timer = timers.start()
    timer.log('qwerty')
    expect(stringLogFn).toHaveReturnedWith(expect.stringMatching('qwerty'))
  })

  it('call end method with arguments', () => {
    const timer = timers.start()
    timer.end('qwerty')
    expect(stringLogFn).toHaveBeenCalledWith(expect.stringMatching('qwerty'))
  })
})
