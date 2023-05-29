import { clearStackPath, filterNotInternalStack, getStackTrace, getTopStackFile, stackToArray } from '../stack'

describe('tests for stack helpers', () => {
  describe('parse stack trace', () => {
    it('get full stacktrace', function namedFunc() {
      expect(getStackTrace()).toMatch('at')
      expect(getStackTrace()).toMatch('namedFunc')
    })

    it('getting a limited stacktrace', function namedFunc() {
      function innerFunc() {
        expect(getStackTrace()).toMatch('innerFunc')
        expect(getStackTrace(innerFunc)).not.toMatch('innerFunc')
      }

      innerFunc()
    })

    it('Preventing a possible prepareStackTrace call', () => {
      const originalPrepare = Error.prepareStackTrace
      const prepareStackTrace = jest.fn()
      Error.prepareStackTrace = prepareStackTrace
      getStackTrace()
      expect(Error.prepareStackTrace).toEqual(prepareStackTrace)
      expect(prepareStackTrace).not.toHaveBeenCalled()
      Error.prepareStackTrace = originalPrepare
    })
  })

  describe('transform stacktrace', () => {
    it('Transforming a stack from a string to an array', () => {
      const stack = getStackTrace()
      const arr = stackToArray(stack)

      expect(arr).toEqual(expect.any(Array))
      for (const val of arr) expect(stack).toMatch(val)
    })

    it('filter out all records with internal/*', () => {
      const stack = getStackTrace()
      const arr = filterNotInternalStack(stackToArray(stack))

      expect(arr).not.toEqual(expect.arrayContaining([expect.stringMatching(/(node:)?internal\//)]))
    })

    it('filter out all records with at*', () => {
      const stack = stackToArray(getStackTrace())
      const arr = filterNotInternalStack(stack)

      expect(stack).toEqual(expect.arrayContaining([expect.stringMatching(/^(?!at)/)]))
      expect(arr).not.toEqual(expect.arrayContaining([expect.stringMatching(/^(?!at)/)]))
    })

    it('remove duplicates from array', () => {
      const arr = filterNotInternalStack(stackToArray(getStackTrace()))
      arr.push(arr.at(-1))

      const resultsArr = filterNotInternalStack(arr)

      expect(resultsArr.length).not.toEqual(arr.length)
      expect(resultsArr.at(-1)).toMatch(/x[0-9]+\)$/)
    })

    it('clear stack path', () => {
      const filename = __filename
      const stackPath = `at someFunc (${filename}:100:200)`

      expect(clearStackPath(stackPath)).toEqual(filename)
    })

    it('get top file from stacktrace', () => {
      function someFunc() {
        expect(getTopStackFile(someFunc)).toEqual(__filename)
      }

      someFunc()
    })
  })
})
