import { appModule, testParser } from '../../helpers/testsHelpers'
import { ILogger } from '../../helpers/types'
import { ItemsTimers, ItemTimerOptions } from '../items.timer'
import { StringFormatter } from '../string.formatter'

describe('Items timers', () => {
  const options: ItemTimerOptions = {
    checkCacheTimeout: 1000,
    maxCacheTime: 10000,
    maxCacheSize: 10,
    logOnStart: false,
  }
  const formatter = new StringFormatter()

  const log = jest.fn((...args) => formatter.format(testParser.parse(args, appModule)))
  const logger: ILogger = {
    debug: log,
    log: log,
    info: log,
    warn: log,
    error: log,
  }

  const timers = new ItemsTimers(logger, options)
  beforeEach(() => {
    if (timers) timers.clear()
    log.mockClear()
  })

  beforeAll(() => {
    jest.useFakeTimers()
  })

  it('call start log without label', () => {
    const stimers = new ItemsTimers(logger, { ...options, logOnStart: true })
    stimers.start()
    expect(log).toHaveReturnedWith(expect.stringMatching('timeStart'))
  })

  it('call start log with label', () => {
    const label = 'qwerty'
    const stimers = new ItemsTimers(logger, { ...options, logOnStart: true })
    stimers.start(label)
    expect(log).toHaveReturnedWith(expect.stringMatching(label))
  })

  it('not called start log', () => {
    timers.start()
    expect(log).not.toHaveBeenCalled()
  })

  it('call log method', () => {
    const timer = timers.start()
    const ms = 123
    jest.advanceTimersByTime(ms)
    timer.log()
    expect(log).toHaveReturnedWith(expect.stringMatching('timeLog'))
    expect(log).toHaveReturnedWith(expect.stringMatching(`${ms}`))
  })

  it('call end method', () => {
    const timer = timers.start()
    const ms = 123
    jest.advanceTimersByTime(ms)
    timer.end()
    expect(log).toHaveReturnedWith(expect.stringMatching('timeEnd'))
    expect(log).toHaveReturnedWith(expect.stringMatching(`${ms}`))
  })

  it('call log method with label', () => {
    const label = 'qwerty'
    const timer = timers.start(label)
    timer.log()
    expect(log).toHaveReturnedWith(expect.stringMatching(label))
  })

  it('call end method with label', () => {
    const label = 'qwerty'
    const timer = timers.start(label)
    timer.end()
    expect(log).toHaveReturnedWith(expect.stringMatching(label))
  })

  it('call log method with arguments', () => {
    const timer = timers.start()
    timer.log('qwerty')
    expect(log).toHaveReturnedWith(expect.stringMatching('qwerty'))
  })

  it('call end method with arguments', () => {
    const timer = timers.start()
    timer.end('qwerty')
    expect(log).toHaveReturnedWith(expect.stringMatching('qwerty'))
  })
})
