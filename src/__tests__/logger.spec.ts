import { PassThrough } from 'stream'
import { TIME_END, TIME_LOG } from '../constants'
import { testStandartLevels } from '../helpers/testHelpers'
import { Logger } from '../logger'
import { ConsoleOut } from '../utils/console.out'
import { StringFormatter } from '../utils/string.formatter'
import { AllowedList } from '../utils/allowed.list'

describe('Main logger', () => {
  let logger: Logger
  let stdout: PassThrough

  beforeAll(() => {
    Logger.formatter = new StringFormatter()
  })

  beforeEach(() => {
    stdout = new PassThrough({ encoding: 'utf-8' })
    Logger.outLogs = new ConsoleOut(stdout, stdout)
    Logger.loggerOptions.debugAllowedList = '*'
    Logger.debugAllowedList = new AllowedList('*')
    logger = new Logger()
  })

  it('BaseLogger constructor', () => {
    const category = 'test category'
    const logger = new Logger(category)

    expect(logger.meta.category).toEqual(category)
  })

  testStandartLevels(Logger)

  describe('counters', () => {
    it('The count() method should return counter', () => {
      const label = 'label'
      const counter = logger.count(label)

      expect(counter).toEqual(expect.any(Function))
      expect(counter.id).toEqual(expect.any(String))
      expect(counter.label).toEqual(label)
      expect(counter.log).toEqual(expect.any(Function))
      expect(counter.end).toEqual(expect.any(Function))
      expect(counter.data).toBeDefined()
    })

    it('A repeated call to count() should return the same counter', () => {
      const counter1 = logger.count('label')
      const counter2 = logger.count('label')

      expect(counter1).toEqual(counter2)
    })

    it('A repeated call to count() should return different counters after the previous one is finished', () => {
      const counter1 = logger.count('label')
      counter1()
      const counter2 = logger.count('label')

      expect(counter1).not.toEqual(counter2)
    })

    it('Calling count() again should return different counters if no label is set', () => {
      const counter1 = logger.count()
      const counter2 = logger.count()

      expect(counter1).not.toEqual(counter2)
    })

    it('Data increment after multiple calls', () => {
      const label = 'label'
      logger.count(label)
      const counter = logger.count(label)
      counter.log()

      expect(counter.data).toEqual(3)
    })
  })

  describe('timers', () => {
    it('The time() method should return timer', () => {
      const label = 'label'
      const timer = logger.time(label)

      expect(timer).toEqual(expect.any(Function))
      expect(timer.id).toEqual(expect.any(String))
      expect(timer.label).toEqual(label)
      expect(timer.log).toEqual(expect.any(Function))
      expect(timer.end).toEqual(expect.any(Function))
      expect(timer.data).toBeDefined()
    })

    it('Calling time() again should return different timers', () => {
      const timer1 = logger.time()
      const timer2 = logger.time()

      expect(timer1).not.toEqual(timer2)
    })

    it('The timeLog method calls the timer log', () => {
      const label = 'label'
      logger.time(label)
      stdout.read()

      logger.timeLog(label)
      const str = stdout.read()
      expect(str).toMatch(label)
      expect(str).toMatch(TIME_LOG)
    })

    it('The timeEnd method ends the timer', () => {
      const label = 'label'
      logger.time(label)
      stdout.read()

      logger.timeEnd(label)
      const str = stdout.read()
      expect(str).toMatch(label)
      expect(str).toMatch(TIME_END)
    })
  })
})
