import { Details } from '../details'
import { ErrorDetails } from '../error.details'
import { ModDetails } from '../mod.details'
import { TimeDetails } from '../time.details'
import { TimeRange } from '../time.range'

describe('details', () => {
  let details: Details

  beforeEach(() => {
    details = new Details()
  })

  it('empty details', () => {
    expect(details.empty).toBeTruthy()
    expect(Object.keys(details.reserved).length).toEqual(0)
    expect(Object.keys(details.hidden).length).toEqual(0)
    expect(Object.keys(details.details).length).toEqual(0)
  })

  describe('errors', () => {
    it('empty list errors', () => {
      expect(details.errors).toEqual(expect.any(Array))
      expect(details.errors.length).toEqual(0)
    })

    it('incorrect type', () => {
      // @ts-ignore
      details.setError('qwerty')
      expect(details.errors.length).toEqual(0)
    })

    it('set error', () => {
      const err = new ErrorDetails(new Error('qwerty'))
      details.setError(err)

      expect(details.errors).toEqual(expect.arrayContaining([err]))
      expect(details.reserved._errors).toEqual(expect.arrayContaining([err]))
    })

    it('error with fields', () => {
      const error = new Error('qwerty')
      Object.assign(error, { field: 'qwerty' })
      const err = new ErrorDetails(error)
      details.setError(err)
      expect(details.empty).toBeFalsy()
      expect(details.details).toEqual(expect.objectContaining({ field: 'qwerty' }))
    })
  })

  describe('times', () => {
    it('empty list times', () => {
      expect(details.times).toEqual(expect.any(Array))
      expect(details.times.length).toEqual(0)
    })

    it('incorrect type', () => {
      // @ts-ignore
      details.setTime('qwerty')
      expect(details.times.length).toEqual(0)
    })

    it('set time', () => {
      const time = new TimeDetails(123)
      details.setTime(time)

      expect(details.times).toEqual(expect.arrayContaining([time]))
      expect(details.reserved._times).toEqual(expect.arrayContaining([time]))
    })
  })

  describe('stacktraces', () => {
    it('empty list stacktraces', () => {
      expect(details.stacks).toEqual(expect.any(Array))
      expect(details.stacks.length).toEqual(0)
    })

    it('set stacktrace', () => {
      const stack = ['at row 1', 'at row 2']
      const label = 'label'
      details.setStacktrace(stack, label)

      expect(details.stacks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            label,
            stack: expect.arrayContaining(stack),
          }),
        ]),
      )
    })
  })

  describe('time range', () => {
    it('set time range', () => {
      const timeRange = new TimeRange(123, 321)
      details.setTimeRange(timeRange)

      expect(details.timeRange).toEqual(timeRange)
      expect(details.reserved._timeRange).toEqual(timeRange)
      expect(details.times).toEqual(expect.arrayContaining([timeRange.delta]))
    })

    it('error when re-adding TimeRange', () => {
      details.setTimeRange(new TimeRange(123))
      expect(() => details.setTimeRange(new TimeRange(321))).toThrow()
    })
  })

  describe('module', () => {
    it('module with class', () => {
      const mod = new ModDetails('module name')
      details.setModule(mod)
      expect(details.module).toEqual(mod)
      expect(details.reserved._module).toEqual(mod)
    })

    it('set module string', () => {
      const name = 'module name'
      const version = 'module.version'
      details.setModule(name, version)

      expect(details.module).toEqual(expect.objectContaining({ name, version }))
    })
  })

  describe('aggregation into objects', () => {
    it('details object', () => {
      const obj = {
        field: 'qwerty',
        field2: 'qwerty 2',
      }

      details.assign(obj)
      expect(details.details).toEqual(expect.objectContaining(obj))
    })

    it('hidden details object', () => {
      const obj = {
        field: 'qwerty',
        field2: 'qwerty 2',
      }

      details.hiddenAssign(obj)
      expect(details.hidden).toEqual(expect.objectContaining(obj))
    })

    it('merge full object to JSON', () => {
      const obj = {
        field: 'qwerty',
        field2: 'qwerty 2',
      }
      const hiddenObj = {
        field3: 'qwerty 3',
        field4: 'qwerty 4',
      }

      details.assign(obj)
      details.hiddenAssign(hiddenObj)
      details.setModule('module name')

      expect(details.toJSON()).toEqual(
        expect.objectContaining({
          ...obj,
          ...hiddenObj,
          ...details.reserved,
        }),
      )
    })
  })
})
