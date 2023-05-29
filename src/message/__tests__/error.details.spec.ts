import { ErrorDetails } from '../error.details'

describe('error details', () => {
  class FieldError extends Error {
    field = 'qwerty'
  }

  it('create instance', () => {
    const testError = new Error('message')
    const error = new ErrorDetails(testError)

    expect(error.name).toEqual(testError.name)
    expect(error.message).toEqual(testError.message)
  })

  it('check stack trace', () => {
    const testError = new Error('message')
    const error = new ErrorDetails(testError)
    error.stack.forEach(str => {
      expect(testError.stack?.includes(str)).toBeTruthy()
    })
  })

  it('Without details fields', () => {
    const testError = new Error('message')
    const error = new ErrorDetails(testError)

    expect(error.hasDetails).not.toBeDefined()
    expect(error.details).not.toBeDefined()
  })

  it('With details fields', () => {
    const testError = new FieldError('message')
    const error = new ErrorDetails(testError)
    expect(error.field).toEqual(testError.field)
    expect(error.details).toEqual({
      field: testError.field,
    })
    expect(error.hasDetails).toBeTruthy()
  })

  it('add Error.cause to details', () => {
    const cause = 'some value'
    const testError = new Error('Some message', { cause })
    const error = new ErrorDetails(testError)
    expect(error.details).toEqual({ cause })
  })

  it('to json', () => {
    const testError = new FieldError('message')
    const error = new ErrorDetails(testError)
    const json = error.toJSON()

    expect(json).toEqual(
      expect.objectContaining({
        message: testError.message,
        name: testError.name,
        stack: expect.any(Array),
        field: 'qwerty',
      }),
    )

    expect(json.error).not.toBeDefined()
    expect(json.hasDetails).not.toBeDefined()
    expect(json.details).not.toBeDefined()
  })

  it('no error argument', () => {
    // @ts-ignore
    const error = new ErrorDetails()
    expect(error.stack).toEqual([])
  })
})
