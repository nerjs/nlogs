import { meta } from '../../helpers/testHelpers'
import { LogReader } from '../log.reader'
import { StaticLogger } from '../static.logger'
import { StringFormatter } from '../string.formatter'
import { DarkStringFormatter } from '../dark.string.formatter'
import { LightStringFormatter } from '../light.string.formatter'
import { filterNotInternalStack, stackToArray } from '../../helpers/stack'

const checkStringFormatter = <F extends StringFormatter>(formatter: F) => {
  const reader = new LogReader(formatter)
  const format = (data: any[]) => formatter.format(reader.read(meta, data))

  it('separator without message', () => {
    const info = reader.read(meta, [])
    const str = formatter.format(info)
    expect(str.endsWith(formatter.separator)).toBeFalsy()
  })

  it('category name', () => {
    const category = 'new Category'
    const str = format([StaticLogger.category(category)])

    expect(str).toMatch(category)
  })

  it('level', () => {
    const levels = ['log', 'trace', 'debug', 'info', 'warn', 'error', 'some level']

    for (const level of levels) {
      const str = format([StaticLogger.level(level)])
      expect(str).toMatch(new RegExp(level, 'i'))
    }
  })

  it('highlight', () => {
    const text = 'highlight text'
    const str = format([StaticLogger.highlight(text)])
    expect(str).toMatch(text)
  })

  describe('time', () => {
    it('time with label', () => {
      const info = reader.read(meta, [StaticLogger.time(123, 'label')])
      const time = info.details.times[0]
      const str = formatter.format(info)

      expect(str).toMatch(time.pretty)
      expect(str).toMatch('label')
    })

    it('time without label', () => {
      const info = reader.read(meta, [StaticLogger.time(123)])
      const time = info.details.times[0]
      const str = formatter.format(info)

      expect(str).toMatch(time.pretty)
    })
  })

  describe('module name', () => {
    it('missing module', () => {
      const str = format([])
      expect(str).toMatch(new RegExp(`[\\${formatter.brackets[0]}]\\s?${meta.category}`))
    })

    it('without version', () => {
      const name = 'module name'
      const str = format([StaticLogger.module(name)])
      expect(str).toMatch(name)
    })

    it('with version', () => {
      const name = 'module name'
      const version = '1.2.3'
      const str = format([StaticLogger.module(name, version)])
      expect(str).toMatch(version)
    })
  })
}

describe('String formatter', () => {
  const formatter = new StringFormatter()
  const reader = new LogReader(formatter)
  const format = (data: any[]) => formatter.format(reader.read(meta, data))

  checkStringFormatter(formatter)

  describe('details', () => {
    it('full details', () => {
      const details = {
        field: 'qwerty',
        field2: 'qwerty 2',
      }

      const str = format([details])

      Object.entries(details).forEach(values => values.forEach(value => expect(str).toMatch(value)))
    })

    it('check depth', () => {
      const details = {
        field1: {
          field2: 'qwerty',
        },
      }

      const str1 = format([details, StaticLogger.depth(10)])
      expect(str1).toMatch('field2')

      const str2 = format([details, StaticLogger.depth(0)])
      expect(str2).toMatch('field1')
      expect(str2).not.toMatch('field2')
    })
  })

  describe('stacktraces', () => {
    it('errors traces', () => {
      const err = new Error('qwerty')
      const stackErr = filterNotInternalStack(stackToArray(err.stack as string))
      const str = format([err])
      stackErr.forEach(row => expect(str).toMatch(row))
    })

    it('meta stacktraces', () => {
      const stack = ['at row 1', 'at row 2']
      const stack2 = ['at row 3', 'at row 4']
      const info = reader.read(meta, [StaticLogger.stacktrace(stack)])
      // @ts-ignore
      info.details.stacks.push(stack2)
      const str = formatter.format(info)
      ;[...stack, ...stack2].forEach(row => expect(str).toMatch(row))
    })

    it('missing stack separator', () => {
      const stack = ['at row 1', 'at row 2']
      const str = format([StaticLogger.stacktrace(stack)])

      expect(str).not.toMatch(new RegExp(`\\n\\s?${formatter.stacktraceSeparator}`))
    })

    it('stack separator', () => {
      const stack = ['at row 1', 'at row 2']
      const str = format([StaticLogger.stacktrace(stack), StaticLogger.stacktrace(stack)])

      expect(str).toMatch(new RegExp(`\\n\\s?${formatter.stacktraceSeparator}`))
    })
  })
})

describe('dark string formatter', () => {
  const formatter = new DarkStringFormatter()
  checkStringFormatter(formatter)
})

describe('light string formatter', () => {
  const formatter = new LightStringFormatter()
  checkStringFormatter(formatter)
})
