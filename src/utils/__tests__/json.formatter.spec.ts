import { Mod } from '../../helpers/mod'
import { Details, DetailsOptions } from '../../message/details'
import { ErrorDetails } from '../../message/error.details'
import { HighlightMessage } from '../../message/highlight.message'
import { MessageInfo } from '../../message/message.info'
import { Meta } from '../../message/meta'
import { TimeDetails } from '../../message/time.details'
import { JsonFormatter } from '../json.formatter'

describe('json formatter', () => {
  const meta = new Meta('project', 'service', 'category', 'level', 'traceId', new Date(), 'module', 'index')
  const detailsOptions: DetailsOptions = {
    canSingleErrorInDetails: true,
    canSingleTimeInDetails: true,
    canSingleTraceInDetails: true,
  }
  const mod = new Mod('app', 'name', 'v1', 'pathname')
  let info: MessageInfo
  const formatter = new JsonFormatter()
  beforeEach(() => {
    info = new MessageInfo(meta, new Details(detailsOptions), mod)
  })

  it('The formatter should return valid JSON', () => {
    const str = formatter.format(info)
    expect(str).toEqual(expect.any(String))
    expect(() => JSON.parse(str)).not.toThrow()
  })

  it('all base fields', () => {
    const obj = JSON.parse(formatter.format(info))

    expect(obj.meta).toBeDefined()
    expect(obj.message).toBeDefined()
    expect(obj.details).toBeDefined()
    expect(obj['@timestamp']).toBeDefined()
  })

  it('metadata core fields', () => {
    const obj = JSON.parse(formatter.format(info))

    ;['project', 'service', 'category', 'level', 'traceId'].forEach(key => {
      expect(obj.meta[key]).toEqual(meta[key])
    })
  })

  it('correct timestamp', () => {
    const obj = JSON.parse(formatter.format(info))
    const timestamp = meta.timestamp.toJSON()

    expect(obj.meta.timestamp).toEqual(timestamp)
    expect(obj['@timestamp']).toEqual(timestamp)
  })

  it('correct index', () => {
    const obj = JSON.parse(formatter.format(info))

    expect(obj.meta.index).toEqual(meta.index)
    expect(obj['@index']).toEqual(meta.index)
  })

  it('correct details', () => {
    const det = { field: 'qwerty' }
    info.details.assign(det)
    const obj = JSON.parse(formatter.format(info))

    expect(obj.details).toEqual(
      expect.objectContaining({
        _module: mod.toJSON(),
        ...det,
      }),
    )
  })

  describe('format message', () => {
    it('symbol in message', () => {
      info.push(Symbol('test symbol'))
      const { message } = JSON.parse(formatter.format(info))
      expect(message).toMatch('test symbol')
    })

    it('error in message', () => {
      const err = new Error('qwerty')
      const ed = new ErrorDetails(err)
      info.push(err, ed)
      const { message } = JSON.parse(formatter.format(info))
      expect(message).toMatch(err.toString())
      expect(message).toMatch(ed.toString())
    })

    it('date in message', () => {
      const date = new Date()
      info.push(date)
      const { message } = JSON.parse(formatter.format(info))
      expect(message).toMatch(JSON.stringify(date))
    })

    it('pretty time in message', () => {
      const time = new TimeDetails(100)
      info.push(time)
      const { message } = JSON.parse(formatter.format(info))
      expect(message).toMatch(time.pretty)
    })

    it('pretty time in message with label', () => {
      const time = new TimeDetails(100, 'label')
      info.push(time)
      const { message } = JSON.parse(formatter.format(info))
      expect(message).toMatch(time.label)
    })

    it('Highlight text in message', () => {
      const text = new HighlightMessage('text')
      info.push(text)
      const { message } = JSON.parse(formatter.format(info))
      expect(message).toMatch(text.text)
    })

    it('array in messages', () => {
      const arr = [1, 'qwerty', 'test']
      info.push(arr)
      const { message } = JSON.parse(formatter.format(info))

      arr.forEach(val => {
        expect(message).toMatch(`${val}`)
      })
    })

    it('other types in message', () => {
      info.push(1, null, true, false, undefined, 'string')
      const { message } = JSON.parse(formatter.format(info))
      expect(message).toMatch('1')
      expect(message).toMatch('null')
      expect(message).toMatch('true')
      expect(message).toMatch('false')
      expect(message).toMatch('undefined')
      expect(message).toMatch('string')
    })
  })
})
