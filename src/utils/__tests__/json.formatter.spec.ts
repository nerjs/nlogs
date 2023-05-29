import { meta } from '../../helpers/testHelpers'
import { JsonFormatter } from '../json.formatter'
import { LogReader } from '../log.reader'
import { StaticLogger } from '../static.logger'

describe('JSON formatter', () => {
  const formatter = new JsonFormatter()

  describe('prepare types', () => {
    it('time', () => {
      expect(formatter.time('pretty')).toMatch('pretty')
      expect(formatter.time('pretty', 'label')).toMatch('label')
    })

    it('error', () => {
      expect(formatter.error('name', 'message')).toMatch('message')
    })

    it('highlight', () => {
      expect(formatter.highlight('highlight text')).toMatch('highlight text')
    })

    it('symbol', () => {
      expect(formatter.symbol(Symbol())).toEqual(expect.any(String))
    })

    it('bigint', () => {
      expect(formatter.bigint(123n)).toEqual(expect.any(String))
    })

    it('date', () => {
      expect(formatter.date(new Date())).toEqual(expect.any(String))
    })

    it('array', () => {
      expect(formatter.array([1, 2, 3])).toEqual(expect.any(String))
    })

    it('null', () => {
      expect(formatter.null(null)).toEqual(expect.any(String))
      expect(formatter.null(undefined)).toEqual(expect.any(String))
    })
  })

  it('message', () => {
    const messages = ['qwerty', 123, true, false]
    const message = formatter.messages(messages)

    for (const val of messages) expect(message).toMatch(`${val}`)
  })

  describe('format', () => {
    const reader = new LogReader(formatter)

    it('correct json', () => {
      const info = reader.read(meta, [])
      const str = formatter.format(info)
      expect(() => JSON.stringify(str)).not.toThrow()
    })

    it('correct message', () => {
      const info = reader.read(meta, ['qwerty', 123, 123n])
      const obj = JSON.parse(formatter.format(info))
      expect(obj.message).toEqual(info.message)
    })

    it('correct meta', () => {
      const info = reader.read(meta, ['qwerty', 123, 123n])
      const obj = JSON.parse(formatter.format(info))
      expect(obj.meta).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(info.meta))))
    })

    it('correct details', () => {
      const info = reader.read(meta, ['qwerty', 123, 123n])
      const obj = JSON.parse(formatter.format(info))
      expect(obj.details).toEqual(info.details.toJSON())
    })

    it('correct timestamp', () => {
      const info = reader.read(meta, [])
      const obj = JSON.parse(formatter.format(info))
      expect(obj['@timestamp']).toEqual(info.meta.timestamp.toJSON())
    })

    it('correct index', () => {
      const info = reader.read(meta, [StaticLogger.index('current index')])
      const obj = JSON.parse(formatter.format(info))
      expect(obj['@index']).toEqual(info.index)
    })
  })
})
