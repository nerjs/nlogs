import { Mod } from '../../helpers/mod'
import { ILogger } from '../../helpers/types'
import { Meta } from '../../message/meta'
import { ColoredFormatter } from '../colored.formatter'
import { ItemCounterOptions, ItemsCounters } from '../items.counter'
import { Parser } from '../parser'

describe('items counters', () => {
  const options: ItemCounterOptions = {
    checkCacheTimeout: 1000,
    maxCacheTime: 10000,
    maxCacheSize: 10,
  }
  const parser = new Parser(
    {
      canSingleErrorInDetails: true,
      canSingleTimeInDetails: true,
      canSingleTraceInDetails: true,
    },
    new Meta('', '', '', '', '', new Date()),
  )
  const mod = new Mod('app', '', '', '')
  const formatter = new ColoredFormatter()

  const log = jest.fn((...args) => formatter.format(parser.parse(args, mod), mod))
  const logger: ILogger = {
    debug: log,
    log: log,
    info: log,
    warn: log,
    error: log,
  }

  const counters = new ItemsCounters(logger, options)

  beforeEach(() => {
    if (counters) counters.clear()
    log.mockClear()
  })

  it('increment counter', () => {
    const counter = counters.start()
    counter.log()
    counter.log()
    counter.log()
    counter.log()
    counter.end()

    expect(log).toHaveNthReturnedWith(1, expect.stringMatching('1'))
    expect(log).toHaveNthReturnedWith(2, expect.stringMatching('2'))
    expect(log).toHaveNthReturnedWith(3, expect.stringMatching('3'))
    expect(log).toHaveNthReturnedWith(4, expect.stringMatching('4'))
    expect(log).toHaveNthReturnedWith(5, expect.stringMatching('5'))
    expect(log).toHaveNthReturnedWith(6, expect.stringMatching('6'))
  })

  it('counter log with arguments', () => {
    const counter = counters.start()
    counter.log('qwerty')
    expect(log).toHaveNthReturnedWith(2, expect.stringMatching('qwerty'))
  })

  it('counter log with label', () => {
    counters.start('label')
    expect(log).toHaveReturnedWith(expect.stringMatching('label'))
  })
})
