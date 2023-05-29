import { INTERPOLATE, IS_META_INFO, META_VALUE, NO_CONSOLE, STACKTRACE } from '../../helpers/symbols'
import { meta, stringFormatter } from '../../helpers/testHelpers'
import { ErrorDetails } from '../../message/error.details'
import { LogInfo } from '../../message/log.info'
import { LogReader } from '../log.reader'
import { StaticLogger } from '../static.logger'

describe('log reader', () => {
  let reader: LogReader

  beforeEach(() => {
    reader = new LogReader(stringFormatter)
  })

  it('reader result', () => {
    expect(reader.read(meta, [])).toBeInstanceOf(LogInfo)
  })

  describe('primitive messages', () => {
    it('simple values', () => {
      const msgs = ['qwerty', 123, true, false, null]
      const info = reader.read(meta, msgs)

      for (const val of msgs) {
        expect(info.message).toMatch(`${val}`)
      }
    })

    it('Blank lines are not included in the message', () => {
      const info = reader.read(meta, [''])
      expect(info.messages.length).toEqual(0)
    })

    it('symbol value', () => {
      const sym = Symbol('qwerty')
      const info = reader.read(meta, [sym])
      const str = stringFormatter.symbol(sym)
      expect(info.message).toMatch(str.toString())
    })

    it('BigInt value', () => {
      const bint = 123n
      const info = reader.read(meta, [bint])
      const str = stringFormatter.messages([stringFormatter.bigint(bint)])
      expect(info.message).toMatch(str)
    })

    it('Date value', () => {
      const date = new Date()
      const info = reader.read(meta, [date])
      const str = stringFormatter.messages([stringFormatter.date(date)])
      expect(info.message).toMatch(str)
    })

    it('Array value', () => {
      const arr = [1, '2', 3]
      const info = reader.read(meta, [arr])
      const str = stringFormatter.messages([stringFormatter.array(arr)])
      expect(info.message).toMatch(str)
    })

    it('object value', () => {
      const obj = {
        field: 'qwerty',
        field2: 123,
      }
      const info = reader.read(meta, [obj])

      expect(info.details.details).toEqual(expect.objectContaining(obj))
    })
  })

  describe('error message', () => {
    let info: LogInfo
    const err = new Error('qwerty')

    beforeEach(() => {
      info = reader.read(meta, [err])
    })

    it('in message', () => {
      const str = stringFormatter.error(err.name, err.message, info)
      expect(info.message).toMatch(str)
    })

    it('in details', () => {
      expect(info.details.errors).toEqual(expect.arrayContaining([expect.any(ErrorDetails)]))
    })
  })

  describe('meta info values', () => {
    describe('interpolate meta info', () => {
      it('interpolate meta info with values', () => {
        const values = ['qwerty', 'test']
        const info = reader.read(meta, [StaticLogger.interpolate(values)])
        expect(info.message).toMatch(values[0])
        expect(info.message).toMatch(values[1])
      })

      it('empty or missing value', () => {
        const info = reader.read(meta, [
          {
            [IS_META_INFO]: INTERPOLATE,
          },
        ])

        expect(info.messages.length).toEqual(0)
      })
    })

    it('show meta value', () => {
      const info = reader.read(meta, [StaticLogger.show(false)])
      expect(info.show).toBeFalsy()
    })

    it('depth meta value', () => {
      const info = reader.read(meta, [StaticLogger.depth(123)])
      expect(info.details.depth).toEqual(123)
    })

    describe('details meta value', () => {
      it('The main object of the details', () => {
        const obj = {
          field: 'qwerty',
          field2: 123,
        }
        const info = reader.read(meta, [StaticLogger.details(obj)])

        expect(info.details.details).toEqual(obj)
      })

      it('Hidden details', () => {
        const obj = {
          field: 'qwerty',
          field2: 123,
        }
        const info = reader.read(meta, [StaticLogger.hiddenDetails(obj)])

        expect(info.details.hidden).toEqual(obj)
      })

      it('No console details', () => {
        const obj = {
          field: 'qwerty',
          field2: 123,
        }
        const info = reader.read(meta, [
          {
            [IS_META_INFO]: NO_CONSOLE,
            [META_VALUE]: obj,
          },
        ])

        expect(info.details.hidden).toEqual(obj)
      })
    })

    it('metadata', () => {
      const project = 'new project'
      const service = 'new service'
      const category = 'new category'
      const traceId = 'new traceId'
      const level = 'new level'
      const timestamp = new Date()

      const info = reader.read(meta, [
        StaticLogger.project(project),
        StaticLogger.service(service),
        StaticLogger.category(category),
        StaticLogger.traceId(traceId),
        StaticLogger.level(level),
        StaticLogger.timestamp(timestamp),
      ])

      expect(info.meta.project).toEqual(project)
      expect(info.meta.service).toEqual(service)
      expect(info.meta.category).toEqual(category)
      expect(info.meta.traceId).toEqual(traceId)
      expect(info.meta.level).toEqual(level)
      expect(info.meta.timestamp).toEqual(timestamp)
    })

    it('info index', () => {
      const index = 'new index'
      const info = reader.read(meta, [StaticLogger.index(index)])
      expect(info.index).toEqual(index)
    })

    it('module details', () => {
      const name = 'module name'
      const version = '1.2.3'
      const info = reader.read(meta, [StaticLogger.module(name, version)])

      expect(info.details.module).toEqual(expect.objectContaining({ name, version }))
    })
  })

  describe('stacktrace', () => {
    it('stacktrace string value', () => {
      const stacks = ['at row 1', 'at row 2']
      const info = reader.read(meta, [
        {
          [IS_META_INFO]: STACKTRACE,
          [META_VALUE]: stacks.join('\n'),
        },
      ])
      expect(info.details.stacks[0]?.stack).toEqual(expect.arrayContaining(stacks))
    })

    it('stacktrace array of string value', () => {
      const stacks = ['at row 1', 'at row 2']
      const info = reader.read(meta, [
        {
          [IS_META_INFO]: STACKTRACE,
          [META_VALUE]: stacks,
        },
      ])
      expect(info.details.stacks[0]?.stack).toEqual(expect.arrayContaining(stacks))
    })

    it('stacktrace object missing stack field', () => {
      const info = reader.read(meta, [
        {
          [IS_META_INFO]: STACKTRACE,
          [META_VALUE]: {},
        },
      ])

      expect(info.details.stacks.length).toEqual(0)
    })

    it('stacktrace object missing label field', () => {
      const info = reader.read(meta, [StaticLogger.stacktrace([])])
      expect(info.details.stacks[0]?.label).not.toBeDefined()
    })

    it('stacktrace object missing label field and first row', () => {
      const stack = ['stack name', 'at row 2']
      const info = reader.read(meta, [StaticLogger.stacktrace(stack)])
      expect(info.details.stacks[0]?.label).toEqual(stack[0])
      expect(info.details.stacks[0]?.stack).toEqual(expect.arrayContaining([stack[1]]))
    })

    it('stacktrace object with stack and label', () => {
      const stack = ['at row 1', 'at row 2']
      const label = 'label'
      const info = reader.read(meta, [StaticLogger.stacktrace(stack, label)])

      expect(info.details.stacks[0]?.label).toEqual(label)
      expect(info.details.stacks[0]?.stack).toEqual(expect.arrayContaining(stack))
    })
  })

  describe('times meta and messages', () => {
    it('time without label', () => {
      const ms = 123
      const info = reader.read(meta, [StaticLogger.time(ms)])
      const time = info.details.times[0]
      const str = stringFormatter.time(time.pretty, null, info)

      expect(time.ms).toEqual(ms)
      expect(info.message).toMatch(str)
    })

    it('time with label', () => {
      const ms = 123
      const label = 'label'
      const info = reader.read(meta, [StaticLogger.time(ms, label)])
      const time = info.details.times[0]
      const str = stringFormatter.time(time.pretty, time.label as string, info)

      expect(info.message).toMatch(str)
    })

    it('time range', () => {
      const info = reader.read(meta, [StaticLogger.timeRange(123, 345)])
      const timeRange = info.details.timeRange
      const str = stringFormatter.time(timeRange?.delta.pretty || '', timeRange?.delta.label || null, info)

      expect(info.message).toMatch(str)
    })
  })
})
