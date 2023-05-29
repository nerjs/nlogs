import { PassThrough } from 'stream'
import { ConsoleOut } from '../console.out'

describe('console out util', () => {
  let stdout: PassThrough
  let stderr: PassThrough
  const data = 'qwerty'
  const outMethods = ['log', 'debug', 'info']
  const errMethods = ['warn', 'error']

  beforeEach(() => {
    stdout = new PassThrough({ encoding: 'utf-8' })
    stderr = new PassThrough({ encoding: 'utf-8' })
  })

  describe('write to stdout without stderr', () => {
    let out: ConsoleOut
    beforeEach(() => {
      out = new ConsoleOut(stdout)
    })
    ;[...outMethods, ...errMethods].forEach(method => {
      it(`${method} method`, () => {
        out.out(data)
        expect(stdout.read()).toMatch(data)
      })
    })
  })

  describe('write to stdout with stderr', () => {
    let out: ConsoleOut
    beforeEach(() => {
      out = new ConsoleOut(stdout, stderr)
    })

    outMethods.forEach(method => {
      it(`${method} method to stdout`, () => {
        out.out(data)
        expect(stdout.read()).toMatch(data)
        expect(stderr.read()).toBeNull()
      })
    })

    errMethods.forEach(method => {
      it(`${method} method to stderr`, () => {
        out.error(data)
        expect(stdout.read()).toBeNull()
        expect(stderr.read()).toMatch(data)
      })
    })
  })
})
