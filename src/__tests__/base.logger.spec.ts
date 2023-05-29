import { PassThrough } from 'stream'
import { BaseLogger } from '../base.logger'
import { getTopStackFile } from '../helpers/stack'
import { clearString } from '../helpers/string'
import { testStandartLevels } from '../helpers/testHelpers'
import { sleep } from '../helpers/time'
import { ConsoleOut } from '../utils/console.out'
import { JsonFormatter } from '../utils/json.formatter'
import { Mod } from '../utils/mod'
import { StringFormatter } from '../utils/string.formatter'

describe('Base logger', () => {
  let stdout: PassThrough
  let stderr: PassThrough
  const originalFormatter = BaseLogger.formatter
  const originalOptions = { ...BaseLogger.loggerOptions }

  const currentPathname = getTopStackFile(getTopStackFile)
  const currentModule = BaseLogger.moduleResolver.resolve(currentPathname)

  beforeEach(() => {
    stdout = new PassThrough({ encoding: 'utf-8' })
    stderr = new PassThrough({ encoding: 'utf-8' })
    BaseLogger.outLogs = new ConsoleOut(stdout, stderr)
    BaseLogger.loggerOptions = { ...originalOptions }
    BaseLogger.formatter = originalFormatter
  })

  it('add category to logger', () => {
    const logger = new BaseLogger('custom category')
    logger.log()
    expect(stdout.read()).toEqual(expect.stringMatching('custom category'))
  })

  it('category pathname in logger', () => {
    const logger = new BaseLogger()
    logger.log()
    expect(stdout.read()).toEqual(
      expect.stringMatching(clearString(currentPathname.replace(currentModule.pathname, ''), /^\/?src\/?/, /^\/?dist\/?/)),
    )
  })

  describe('logger options', () => {
    it('index option', () => {
      BaseLogger.formatter = new JsonFormatter()
      const logger = new BaseLogger(null, { index: 'custom index' })
      logger.log()

      const obj = JSON.parse(stdout.read())
      expect(obj['@index']).toEqual('custom index')
    })

    it('show logs', () => {
      const logger = new BaseLogger(null, { show: true })
      logger.trace()

      const str = stdout.read()
      expect(str).not.toBeNull()
    })

    it('The show() method overrides the show option', () => {
      const logger = new BaseLogger(null, { show: true })
      logger.show(false)
      logger.trace()

      const str = stdout.read()
      expect(str).toBeNull()
    })

    it('hide logs', () => {
      const logger = new BaseLogger(null, { show: false })
      logger.trace()

      expect(stdout.read()).toBeNull()
    })

    it('missing meta service', () => {
      const { defaultMeta } = BaseLogger
      BaseLogger.defaultMeta = defaultMeta.clone()
      // @ts-expect-error
      delete BaseLogger.defaultMeta.service

      const logger = new BaseLogger()
      expect(logger.meta.service).toEqual(logger.module.name)
    })
  })

  describe('formatter', () => {
    beforeEach(() => {
      jest.resetModules()
    })
    ;[
      { key: 'json', name: 'JsonFormatter', pathname: '../utils/json.formatter' },
      { key: 'light', name: 'LightStringFormatter', pathname: '../utils/light.string.formatter' },
      { key: 'dark', name: 'DarkStringFormatter', pathname: '../utils/dark.string.formatter' },
      { key: 'string', name: 'StringFormatter', pathname: '../utils/string.formatter' },
    ].forEach(({ key, name, pathname }) => {
      it(`"${key}" formatter`, async () => {
        const { loggerOptions } = await import('../options')
        const { [name]: formatter } = await import(pathname)
        loggerOptions.formatterType = key as any
        const { BaseLogger } = await import('../base.logger')

        expect(BaseLogger.formatter).toBeInstanceOf(formatter)
      })
    })
  })

  testStandartLevels(BaseLogger)

  it('messages with module', () => {
    BaseLogger.formatter = new JsonFormatter()
    const logger = new BaseLogger()
    const module = new Mod('module', 'moduleName', '1.0.0', 'pathname')
    const app = BaseLogger.moduleResolver.app
    Object.defineProperty(logger, 'module', {
      value: module,
    })

    logger.log()
    const obj = JSON.parse(stdout.read())

    expect(obj.details._app.name).toEqual(app.name)
    expect(obj.details._module.name).toEqual(module.name)
  })

  describe('global hidden details', () => {
    beforeEach(() => {
      BaseLogger.formatter = new JsonFormatter()
    })
    it('messages with hiddenDetails', () => {
      const logger = new BaseLogger()
      const {
        // @ts-ignore
        options: { hiddenDetails },
      } = logger

      logger.log()
      const { details } = JSON.parse(stdout.read())

      expect(details).toEqual(expect.objectContaining(hiddenDetails))
    })

    it('messages without hiddenDetails', () => {
      const logger = new BaseLogger()
      // @ts-ignore
      const { options } = logger
      const { hiddenDetails } = options
      delete options.hiddenDetails

      logger.log()
      const { details } = JSON.parse(stdout.read())

      expect(details).not.toEqual(expect.objectContaining(hiddenDetails))
    })
  })

  describe('trace data', () => {
    beforeEach(() => {
      BaseLogger.formatter = new JsonFormatter()
    })

    it('set trace details', () => {
      const logger = new BaseLogger()
      const firstDetails = {
        field1: 'value 1',
        field2: 'value 2',
      }

      const secondDetails = {
        field3: 'value 3',
        field4: 'value 4',
      }
      BaseLogger.setTraceDetails(firstDetails)
      logger.log()

      const { details: first } = JSON.parse(stdout.read())
      expect(first).toEqual(expect.objectContaining(firstDetails))

      BaseLogger.setTraceDetails(secondDetails)
      logger.log()

      const { details: second } = JSON.parse(stdout.read())
      expect(second).not.toEqual(expect.objectContaining(firstDetails))
      expect(second).toEqual(expect.objectContaining(secondDetails))
    })

    it('merge trace details', () => {
      const logger = new BaseLogger()
      const firstDetails = {
        field1: 'value 1',
        field2: 'value 2',
      }

      const secondDetails = {
        field3: 'value 3',
        field4: 'value 4',
      }
      BaseLogger.mergeTraceDetails(firstDetails)
      BaseLogger.mergeTraceDetails(secondDetails)
      logger.log()

      const { details } = JSON.parse(stdout.read())
      expect(details).toEqual(expect.objectContaining(firstDetails))
      expect(details).toEqual(expect.objectContaining(secondDetails))
    })

    it('Throwing traceId down the stack', async () => {
      const logger = new BaseLogger()

      await BaseLogger.run(async () => {
        logger.log()
        const {
          meta: { traceId: firstTraceId },
        } = JSON.parse(stdout.read())

        expect(firstTraceId).toBeDefined()
        await sleep(10)
        await (async () => {
          await sleep(11)
          logger.log()
          const {
            meta: { traceId: secondTraceId },
          } = JSON.parse(stdout.read())

          expect(secondTraceId).toEqual(firstTraceId)
        })()
      })
    })
  })

  describe('use strict levels rules', () => {
    beforeEach(() => {
      BaseLogger.loggerOptions.debugLevels = ['trace', 'debug']
      BaseLogger.debugAllowedList.update('!')
      BaseLogger.formatter = new StringFormatter()
    })

    it('If the strictLevelRules parameter is specified as FALSE, the level override will work ', async () => {
      BaseLogger.loggerOptions.strictLevelRules = false

      const logger = new BaseLogger()
      logger.debug(BaseLogger.level('info'))

      expect(stdout.read()).not.toBeNull()
    })

    it('If the strictLevelRules parameter is specified as TRUE, the level override will not work', async () => {
      BaseLogger.loggerOptions.strictLevelRules = true

      const logger = new BaseLogger()
      logger.debug(BaseLogger.level('info'))
      expect(stdout.read()).toBeNull()
    })

    it('If the strictLevelRules parameter is specified as false, the check will take place after a possible level override', async () => {
      BaseLogger.loggerOptions.strictLevelRules = false

      const logger = new BaseLogger()
      logger.debug('some message')

      expect(stdout.read()).toBeNull()
    })
  })
})
