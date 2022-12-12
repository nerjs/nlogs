import { Details, DetailsOptions } from '../details'
import { ErrorDetails } from '../error.details'
import { TimeDetails } from '../time.details'

const options: DetailsOptions = {
  canSingleErrorInDetails: true,
  canSingleTimeInDetails: true,
  canSingleTraceInDetails: true,
}

const testSpecialFields = <
  F extends 'error' | 'stack' | 'time',
  T extends F extends 'error' ? ErrorDetails : F extends 'time' ? TimeDetails : string[] | { label: string; stack: string[] },
  N extends keyof DetailsOptions,
>(
  type: F,
  first: T,
  second: T,
  optionName: N,
) => {
  const onceField = `_${type}`
  const arrayField = `_${type}s`
  const setMethod = type === 'error' ? 'setError' : type === 'stack' ? 'setStack' : 'setTime'
  const setData = (details: Details, data: T) => {
    details[setMethod](data as any)
  }
  const allowOpt = {
    ...options,
    [optionName]: true,
  }
  const disallowOpt = {
    ...options,
    [optionName]: false,
  }

  describe(`test special field ${type}`, () => {
    it('first item with allowed array', () => {
      const details = new Details(allowOpt)

      setData(details, first)
      expect(details[onceField]).toEqual(first)
      expect(details[arrayField]).not.toBeDefined()
    })

    it('first item with disallowed array', () => {
      const details = new Details(disallowOpt)

      setData(details, first)
      expect(details[arrayField]).toEqual(expect.arrayContaining([first]))
      expect(details[onceField]).not.toBeDefined()
    })

    it('second item', () => {
      const details = new Details(allowOpt)

      setData(details, first)
      setData(details, second)
      expect(details[arrayField]).toEqual(expect.arrayContaining([first, second]))
      expect(details[onceField]).not.toBeDefined()
    })

    it('present once', () => {
      const details = new Details(allowOpt)

      setData(details, first)
      details[arrayField] = ['test']
      setData(details, second)
      expect(details[arrayField]).toEqual(expect.arrayContaining([first, 'test', second]))
      expect(details[onceField]).not.toBeDefined()
    })

    it('present array', () => {
      const details = new Details(allowOpt)

      details[arrayField] = ['test']
      setData(details, first)
      expect(details[arrayField]).toEqual(expect.arrayContaining(['test', first]))
    })

    it('Array field is not array', () => {
      const details = new Details(allowOpt)

      details[arrayField] = 'test'
      setData(details, first)
      setData(details, second)
      expect(details[arrayField]).toEqual('test')
      expect(details[`_${arrayField}`]).toEqual(expect.arrayContaining([first, second]))
    })
  })
}

describe('details', () => {
  it('assign object', () => {
    const details = new Details(options)
    const testData = {
      field: 'qwerty',
      field2: 'tratata',
    }

    expect(details.empty).toBeTruthy()
    details.assign(testData)
    expect(details).toEqual(expect.objectContaining(testData))
    expect(details.empty).toBeFalsy()
  })

  it('assign no console object', () => {
    const details = new Details(options)
    const testData = {
      field: 'qwerty',
      field2: 'tratata',
    }

    details.setNoConsole(testData)
    expect(details).not.toEqual(expect.objectContaining(testData))
    expect(details.toJSON()).toEqual(expect.objectContaining(testData))
    expect(details.empty).toBeTruthy()
  })

  it('set depth', () => {
    const details = new Details(options)
    details.setDepth(1)
    expect(details._depth).toEqual(1)
  })

  describe('special fields', () => {
    it('set no ErrorDetails instance', () => {
      const details = new Details(options)
      // @ts-ignore
      details.setError('unknown')

      expect(details._error).not.toBeDefined()
    })

    it('set no TimeDetails instance', () => {
      const details = new Details(options)
      // @ts-ignore
      details.setTime('unknown')

      expect(details._time).not.toBeDefined()
    })

    it('set error with details', () => {
      class TestError extends Error {
        field = 'qwerty'
      }
      const te = new TestError('message')
      const details = new Details(options)

      details.setError(new ErrorDetails(te))

      expect(details.empty).toBeFalsy()
      expect(details.field).toEqual(te.field)
    })

    it('set string stack', () => {
      const details = new Details(options)
      details.setStack('at row1\nat row2')

      expect(details._stack).toEqual(expect.arrayContaining(['at row1', 'at row2']))
    })

    it('set stack with label', () => {
      const details = new Details(options)
      details.setStack(['at row1', 'at row2'], 'label')

      expect(details._stack).toEqual(
        expect.objectContaining({
          label: 'label',
          stack: expect.arrayContaining(['at row1', 'at row2']),
        }),
      )
    })

    it('to JSON', () => {
      const details = new Details(options)
      details.setStack(['at row1', 'at row2'], 'label')
      details.setError(new ErrorDetails(new Error()))
      details.setTime(new TimeDetails(1))

      const json = details.toJSON()

      expect(json._error).toBeDefined()
      expect(json._stack).toBeDefined()
      expect(json._time).toBeDefined()
    })

    it('to cleared JSON', () => {
      const details = new Details(options)
      details.setStack(['at row1', 'at row2'], 'label')
      details.setError(new ErrorDetails(new Error()))
      details.setTime(new TimeDetails(1))

      const json = details.toClearedJSON()

      expect(json._error).not.toBeDefined()
      expect(json._stack).not.toBeDefined()
      expect(json._time).not.toBeDefined()
    })

    testSpecialFields('error', new ErrorDetails(new Error()), new ErrorDetails(new Error()), 'canSingleErrorInDetails')
    testSpecialFields('time', new TimeDetails(12), new TimeDetails(13, 'label'), 'canSingleTimeInDetails')
    testSpecialFields('stack', ['row1', 'row2'], ['row3', 'row4'], 'canSingleTraceInDetails')
  })
})
