import { appModule, defaultMeta, depModule, testParser } from '../../helpers/testsHelpers'
import { StaticLogger } from '../static.logger'
import { StringFormatter } from '../string.formatter'

describe('string formatter', () => {
  describe('formatter options', () => {
    it('defaults meta', () => {
      const formatter = new StringFormatter()
      const str = formatter.format(testParser.parse([], appModule), appModule)
      expect(str).toMatch(defaultMeta.category)
      expect(str).toMatch(new RegExp(defaultMeta.level, 'i'))
    })

    it('module should not be shown', () => {
      const formatter = new StringFormatter({
        showModule: false,
      })
      const str = formatter.format(testParser.parse([], depModule), depModule)
      expect(str).not.toMatch(depModule.name)
    })

    it('application module should not be shown', () => {
      const formatter = new StringFormatter()
      const str = formatter.format(testParser.parse([], appModule), appModule)
      expect(str).not.toMatch(appModule.name)
    })

    it('module should be shown without a version', () => {
      const formatter = new StringFormatter({
        showModule: true,
        showModuleVersion: false,
      })
      const str = formatter.format(testParser.parse([], depModule), depModule)
      expect(str).toMatch(depModule.name)
      expect(str).not.toMatch(depModule.version)
    })

    it('module with version should be shown', () => {
      const formatter = new StringFormatter({
        showModule: true,
        showModuleVersion: true,
      })
      const str = formatter.format(testParser.parse([], depModule), depModule)
      expect(str).toMatch(depModule.name)
      expect(str).toMatch(depModule.version)
    })

    it('level wrapper', () => {
      const wrappedLevel = 'WRAPPED_DEBUG'
      const formatter = new StringFormatter({
        debug: () => wrappedLevel,
      })
      const str = formatter.format(testParser.parse([StaticLogger.level('debug')], appModule), appModule)
      expect(str).toMatch(wrappedLevel)
    })
  })

  describe('build message', () => {
    const formatter = new StringFormatter()
    const parse = (msgs: any[]) => testParser.parse(msgs, appModule)
    const format = (...msgs: any[]) => formatter.format(parse(msgs), appModule)

    it('no brackets in a single message', () => {
      const info = parse([new Error('Qwerty error')])
      const str = formatter.format(info, appModule)
      expect(str).not.toMatch(new RegExp(`\\[${info.details._error.toString()}\\]`))
    })

    it('brackets for multiple messages', () => {
      const info = parse(['qwerty', new Error('Qwerty error')])
      const str = formatter.format(info, appModule)
      expect(str).toMatch(new RegExp(`\\[${info.details._error.toString()}\\]`))
    })

    it('value in message', () => {
      const value = 'qwerty'
      const str = format(value)
      expect(str).toMatch(value)
    })

    it('date in message', () => {
      const value = new Date()
      const str = format(value)
      expect(str).toMatch(value.toJSON())
    })

    it('pretty time in message', () => {
      const info = parse([StaticLogger.timeRange(123, 1234)])
      const str = formatter.format(info, appModule)
      expect(str).toMatch(info.timeRange.delta.pretty)
      expect(str).toMatch(info.timeRange.delta.label)
    })

    it('pretty time in message without label', () => {
      const str = format(StaticLogger.time(12))
      expect(str).toMatch(/12\s?ms/)
    })

    it('details in message', () => {
      const info = testParser.parse([{ field: 'qwerty' }], appModule)
      const formatter = new StringFormatter()
      const str = formatter.format(info, appModule)
      expect(str).toMatch('field')
      expect(str).toMatch('qwerty')
    })

    it('stacktrace in message', () => {
      const stack = ['at first', 'at second']
      const label = 'label stacktrace'
      const str = format(StaticLogger.stacktrace(stack, label))
      ;[...stack, label].forEach(slabel => expect(str).toMatch(slabel))
    })

    it('once stacktrace without label in message', () => {
      const stack = ['at first', 'at second']
      const str = format(StaticLogger.stacktrace(stack))
      stack.forEach(slabel => expect(str).toMatch(slabel))
      expect(str).not.toMatch(formatter.theme.emptyStackLabel)
    })

    it('stacktrace without label in message', () => {
      const stack = ['at first', 'at second']
      const str = format(StaticLogger.stacktrace(stack), StaticLogger.stacktrace('s'))
      stack.forEach(slabel => expect(str).toMatch(slabel))
      expect(str).toMatch(formatter.theme.emptyStackLabel)
    })
  })
})
