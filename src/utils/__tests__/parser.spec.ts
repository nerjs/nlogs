import { ErrorDetails } from '../../message/error.details'
import { HighlightMessage } from '../../message/highlight.message'
import { Meta } from '../../message/meta'
import { TimeDetails } from '../../message/time.details'
import { StaticLogger } from '../static.logger'
import { ParserOptions, Parser } from '../parser'
import { MessageInfo } from '../../message/message.info'
import { TimeRange } from '../../message/time.range'

describe('log data parser', () => {
  const options: ParserOptions = {
    canSingleErrorInDetails: true,
    canSingleTimeInDetails: true,
    canSingleTraceInDetails: true,
  }
  const meta = new Meta('project', 'service', 'category', 'debug', 'traceId', new Date(), 'module', 'index', true)
  let parser: Parser

  beforeEach(() => {
    parser = new Parser(options, meta)
  })

  it('default return info', () => {
    const info = parser.parse([])
    expect(info).toBeInstanceOf(MessageInfo)
    expect(info.meta).toEqual(meta)
  })

  it('parse simple types', () => {
    const types = [1, '1', null, true, false, undefined, Symbol(), new Date(), BigInt(1), Date]
    expect(parser.parse(types).messages).toEqual(types)
  })

  it('parse error', () => {
    const error = new Error('qwerty')
    const info = parser.parse([error])

    expect(info.messages).toEqual(expect.arrayContaining([expect.any(ErrorDetails)]))
    expect(info.details._error).toBeInstanceOf(ErrorDetails)
  })

  it('parse time', () => {
    const info = parser.parse([StaticLogger.time(12)])

    expect(info.messages).toEqual(expect.arrayContaining([expect.any(TimeDetails)]))
    expect(info.details._time).toBeInstanceOf(TimeDetails)
  })

  it('parse stacktrace', () => {
    const info = parser.parse([StaticLogger.stacktrace('at row1', 'label')])

    expect(info.details._stack).toEqual({ stack: ['at row1'], label: 'label' })
  })

  it('parse highlight', () => {
    const text = 'text'
    expect(parser.parse([StaticLogger.highlight(text)]).messages).toEqual(expect.arrayContaining([expect.any(HighlightMessage)]))
  })

  it('time range with end date', () => {
    const delta = 1000
    const from = new Date(Date.now() - delta - 100)
    const to = new Date(Date.now() - 100)
    const info = parser.parse([StaticLogger.timeRange(from, to)])

    expect(info.timeRange).toEqual(info.details._timeRange)
    expect(info.timeRange).toBeInstanceOf(TimeRange)
    expect(info.timeRange.delta.ms).toEqual(delta)
    expect(info.timeRange.from).toEqual(from)
    expect(info.timeRange.to).toEqual(to)
  })

  it('time range without end date', () => {
    const from = new Date(Date.now() - 100)
    const info = parser.parse([StaticLogger.timeRange(from)])

    expect(info.timeRange.from).toEqual(from)
    expect(info.timeRange.to).toBeInstanceOf(Date)
  })

  it('time range with numbers arguments', () => {
    const delta = 1000
    const to = Date.now()
    const from = to - delta
    const info = parser.parse([StaticLogger.timeRange(from, to)])

    expect(info.timeRange.from.getTime()).toEqual(from)
    expect(info.timeRange.to.getTime()).toEqual(to)
  })

  it('time range cannot be added twice', () => {
    expect(() => parser.parse([StaticLogger.timeRange(1), StaticLogger.timeRange(2)])).toThrow()
  })

  it('start time greater than the end time', () => {
    expect(() => parser.parse([StaticLogger.timeRange(2, 1)])).toThrow()
  })

  it('parse depth', () => {
    const info = parser.parse([StaticLogger.depth(10)])
    expect(info.details._depth).toEqual(10)
    expect(info.depth).toEqual(10)
  })

  it('parse details', () => {
    const details = { field: 'qwerty' }
    expect(parser.parse([StaticLogger.details(details)]).details.toClearedJSON()).toEqual(details)
  })

  it('parse no console details', () => {
    const details = { field: 'qwerty' }
    const info = parser.parse([StaticLogger.noConsole(details)])
    expect(info.details.toJSON()).toEqual(details)
    expect(info.details.toClearedJSON()).not.toEqual(details)
  })

  it('parse objects details', () => {
    const details = { field: 'qwerty' }
    const info = parser.parse([details])
    expect(info.details.toJSON()).toEqual(details)
  })

  it('parse meta', () => {
    const module = 'module2'
    const project = 'project2'
    const service = 'service2'
    const category = 'category2'
    const level = 'level2'
    const traceId = 'traceId2'
    const index = 'index2'
    const timestamp = new Date()

    const info = parser.parse([
      StaticLogger.module(module),
      StaticLogger.project(project),
      StaticLogger.service(service),
      StaticLogger.category(category),
      StaticLogger.level(level),
      StaticLogger.traceId(traceId),
      StaticLogger.index(index),
      StaticLogger.timestamp(timestamp),
    ])

    expect(info.meta.module).toEqual(module)
    expect(info.meta.project).toEqual(project)
    expect(info.meta.service).toEqual(service)
    expect(info.meta.category).toEqual(category)
    expect(info.meta.level).toEqual(level)
    expect(info.level).toEqual(level)
    expect(info.meta.traceId).toEqual(traceId)
    expect(info.meta.index).toEqual(index)
    expect(info.timestamp).toEqual(timestamp)
    expect(info.meta.timestamp).toEqual(timestamp)
  })

  it('interpolate', () => {
    const data = ['qwerty', 123, Symbol('test')]
    const info = parser.parse([StaticLogger.interpolate(data)])
    expect(info.messages).toEqual(expect.arrayContaining(data))
  })

  it('parse show', () => {
    const info = parser.parse([StaticLogger.show(false)])
    expect(info.show).toBeFalsy()
  })

  it('empty', () => {
    const info = parser.parse([StaticLogger.empty()])

    expect(info.messages.length).toEqual(0)
    expect(info.details.empty).toBeTruthy()
  })
})
