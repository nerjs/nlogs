import { PassThrough } from 'stream'
import { DEFAULT_CATEGORY } from '../constants'
import { testStandartLevels } from '../helpers/testHelpers'
import { LogInfo } from '../message/log.info'
import { TemplateLogger } from '../template.logger'
import { ConsoleOut } from '../utils/console.out'
import { StringFormatter } from '../utils/string.formatter'

describe('Template logger', () => {
  let logger: TemplateLogger
  let stdout: PassThrough

  beforeEach(() => {
    TemplateLogger.formatter = new StringFormatter()
    stdout = new PassThrough({ encoding: 'utf-8' })
    TemplateLogger.outLogs = new ConsoleOut(stdout, stdout)
    logger = new TemplateLogger(DEFAULT_CATEGORY)
    logger.template`${info => info.message}`
  })

  it('Log of the specified template', () => {
    const str = 'Some string'
    const str2 = 'Some hide string'
    logger.template`
        ${str}
    `

    logger.info(str2)
    const output = stdout.read()

    expect(output).toMatch(str)
    expect(output).not.toMatch(str2)
  })

  it('Message on the basis of log call', () => {
    const funcFilter = jest.fn<string, [LogInfo]>(info => `[${info.message}]`)
    const msg = 'some string message'
    logger.template`
      ${funcFilter}
    `
    logger.info(msg)
    const output = stdout.read()

    expect(funcFilter).toHaveBeenCalled()
    expect(funcFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        message: msg,
        meta: expect.any(Object),
        details: expect.any(Object),
      }),
    )

    expect(output).toMatch(`[${msg}]`)
  })

  testStandartLevels(TemplateLogger, (logger: TemplateLogger) => {
    logger.template`${info => info.message}`
  })

  describe('Overriding metadata in the template', () => {
    it('category field', () => {
      const category = 'new category'
      logger.template`
        ${TemplateLogger.category(category)}
      `
      logger.info('some text')
      const output = stdout.read()

      expect(output).toMatch(category)
      expect(output).not.toMatch(DEFAULT_CATEGORY)
    })

    it('level field', () => {
      const level = 'custom level'
      logger.template`
        ${TemplateLogger.level(level)}
      `
      logger.info('some text')
      const output = stdout.read()
      expect(output).toMatch(new RegExp(level, 'i'))
      expect(output).not.toMatch(/info/i)
    })

    it('module field', () => {
      const module = 'new module'
      logger.template`
        ${TemplateLogger.module(module)}
      `
      logger.info('some text')
      const output = stdout.read()
      expect(output).toMatch(module)
    })
  })

  it('clear last spaces after string', () => {
    logger.template`
      some string
      last  
    `

    logger.info()
    const output = stdout.read()

    expect(output).toMatch(new RegExp('last\n$'))
  })

  it('clear last spaces after metadata', () => {
    logger.template`
      some string
      last  
      ${TemplateLogger.category('category')}
    `

    logger.info()
    const output = stdout.read()

    expect(output).toMatch(new RegExp('last\n$'))
  })
})
