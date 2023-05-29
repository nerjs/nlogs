import { NlogsError } from '../nlogs.error'

describe('Nlogs error', () => {
  const code = 'test_code'
  class TestError extends NlogsError {
    code: string = code
    someField = 'qwerty'
  }

  it('cause', () => {
    const cause = 'some value'
    const err = new TestError('message', cause)

    expect(err.cause).toEqual(cause)
  })

  it('name', () => {
    const err = new TestError('message')

    expect(err.name).toEqual('TestError')
  })

  it('toString', () => {
    const message = 'some message'
    const err = new TestError(message)
    expect(err.toString()).toMatch(message)
    expect(err.toString()).toMatch(err.name)
  })

  it('toJson', () => {
    const err = new TestError('some message')
    expect(err.toJSON()).toEqual(
      expect.objectContaining({
        name: err.name,
        someField: err.someField,
        code: err.code,
        message: err.message,
        stack: err.stack,
      }),
    )
  })
})
