/* eslint-disable prefer-rest-params */
import {
  DEFAULT_CATEGORY,
  DEFAULT_CHECK_CACHE_TIMEOUT_MS,
  DEFAULT_DEBUG_LEVELS,
  DEFAULT_FORMATTER,
  DEFAULT_LOG_ON_START,
  DEFAULT_MAX_CACHE_SIZE,
  DEFAULT_MAX_CACHE_TIME_MS,
  DEFAULT_MODULE_DEBUG_LEVELS,
  DEFAULT_PROJECT,
  DEFAULT_SERVICE,
  DEFAULT_STRICT_LEVEL_RULES,
  PRODUCTION_FORMATTER,
} from '../constants'
import { createOptionsChecker } from '../helpers/testHelpers'

describe('generating parameters from environment variables', () => {
  beforeEach(() => {
    process.env = {}
    jest.resetModules()
  })

  describe('logging options', () => {
    const { ivSArrayOfString, ivString, ivBoolean, ivEnum, load } = createOptionsChecker('loggerOptions')

    describe('debugLevels field', () => {
      ivSArrayOfString('debugLevels', ['NLOGS_DEBUG_LEVELS', 'DEBUG_LEVELS'], DEFAULT_DEBUG_LEVELS, 'DEFAULT_DEBUG_LEVELS')
    })

    describe('moduleDebugLevels field', () => {
      ivSArrayOfString(
        'moduleDebugLevels',
        ['NLOGS_MODULE_DEBUG_LEVELS', 'MODULE_DEBUG_LEVELS'],
        DEFAULT_MODULE_DEBUG_LEVELS,
        'DEFAULT_MODULE_DEBUG_LEVELS',
      )
    })

    describe('allowedLevels field', () => {
      ivString('allowedLevels', ['NLOGS_LEVEL', 'LOGGER_LEVEL', 'LEVEL'], undefined)
      ivSArrayOfString('allowedLevels', ['NLOGS_LEVELS', 'LOGGER_LEVELS', 'LEVELS'], undefined)
    })

    describe('isDev field', () => {
      it('development mode', async () => {
        process.env.NODE_ENV = 'development'
        const { loggerOptions } = await import('../options')

        expect(loggerOptions.isDev).toBeTruthy()
      })

      it('production mode', async () => {
        process.env.NODE_ENV = 'production'
        const { loggerOptions } = await import('../options')

        expect(loggerOptions.isDev).toBeFalsy()
      })

      it('custom mode', async () => {
        process.env.NODE_ENV = 'custom' as any
        const { loggerOptions } = await import('../options')

        expect(loggerOptions.isDev).toBeTruthy()
      })

      it('missing NODE_ENV', async () => {
        const { loggerOptions } = await import('../options')
        expect(loggerOptions.isDev).toBeTruthy()
      })
    })

    describe('strictLevelRules field', () => {
      ivBoolean(
        'strictLevelRules',
        ['NLOGS_STRICT_LEVEL_RULES', 'LOGGER_STRICT_LEVEL_RULES'],
        DEFAULT_STRICT_LEVEL_RULES,
        'DEFAULT_STRICT_LEVEL_RULES',
      )
    })

    describe('index field', () => {
      it('from "LOGGER_DEFAULT_INDEX"', async () => {
        process.env.LOGGER_DEFAULT_INDEX = 'idx'
        const { loggerOptions } = await import('../options')
        expect(loggerOptions.index).toEqual('idx')
      })
    })

    describe('formatterType field', () => {
      ivEnum(
        'formatterType',
        ['NLOGS_FORMATTER', 'LOGGER_FORMATTER'],
        ['json', 'light', 'dark', 'string'],
        DEFAULT_FORMATTER,
        'DEFAULT_FORMATTER',
      )

      it('default format in production', async () => {
        process.env.NODE_ENV = 'production'
        const value = await load('formatterType')
        expect(value).toEqual(PRODUCTION_FORMATTER)
      })
    })

    describe('categoriesAllowedList field', () => {
      ivString(
        'categoriesAllowedList',
        [
          'NLOGS_CATEGORY',
          'LOGGER_CATEGORY',
          'SHOW_CATEGORY',
          'ALLOWED_CATEGORY',
          'CATEGORY',
          'NLOGS_CATEGORIES',
          'LOGGER_CATEGORIES',
          'SHOW_CATEGORIES',
          'ALLOWED_CATEGORIES',
          'CATEGORIES',
        ],
        undefined,
      )
    })

    describe('debugAllowedList field', () => {
      ivString('debugAllowedList', ['NLOGS_DEBUG', 'LOGGER_DEBUG', 'NODE_DEBUG', 'DEBUG'], undefined)
    })

    describe('defaultProject field', () => {
      ivString('defaultProject', ['NLOGS_PROJECT', 'LOGGER_PROJECT', 'PROJECT'], DEFAULT_PROJECT, 'DEFAULT_PROJECT')
    })

    describe('defaultService field', () => {
      ivString('defaultService', ['NLOGS_SERVICE', 'LOGGER_SERVICE', 'SERVICE'], DEFAULT_SERVICE, 'DEFAULT_SERVICE')
    })

    describe('defaultCategory field', () => {
      it(`from default value (${DEFAULT_CATEGORY}) (constant "DEFAULT_CATEGORY")`, async () => {
        const { loggerOptions } = await import('../options')

        expect(loggerOptions.defaultCategory).toEqual(DEFAULT_CATEGORY)
      })
    })
  })

  describe('times options', () => {
    const { ivBoolean, ivNumber } = createOptionsChecker('timesOptions')

    describe('max cache time', () => {
      ivNumber(
        'maxCacheTime',
        ['NLOGS_TIME_MAX_CACHE_TIME', 'NLOGS_ITEM_MAX_CACHE_TIME'],
        DEFAULT_MAX_CACHE_TIME_MS,
        'DEFAULT_MAX_CACHE_TIME_MS',
      )
    })

    describe('check cache timeout', () => {
      ivNumber(
        'checkCacheTimeout',
        ['NLOGS_TIME_CHECK_CACHE_TIMEOUT', 'NLOGS_ITEM_CHECK_CACHE_TIMEOUT'],
        DEFAULT_CHECK_CACHE_TIMEOUT_MS,
        'DEFAULT_CHECK_CACHE_TIMEOUT_MS',
      )
    })

    describe('max cache size', () => {
      ivNumber('maxCacheSize', ['NLOGS_TIME_MAX_CACHE_SIZE', 'NLOGS_ITEM_MAX_CACHE_SIZE'], DEFAULT_MAX_CACHE_SIZE, 'DEFAULT_MAX_CACHE_SIZE')
    })

    describe('log on start', () => {
      ivBoolean('logOnStart', 'NLOGS_TIME_LOG_ON_START', DEFAULT_LOG_ON_START, 'DEFAULT_LOG_ON_START')
    })
  })

  describe('counters options', () => {
    const { ivNumber } = createOptionsChecker('countOptions')

    describe('max cache time', () => {
      ivNumber(
        'maxCacheTime',
        ['NLOGS_COUNT_MAX_CACHE_TIME', 'NLOGS_ITEM_MAX_CACHE_TIME'],
        DEFAULT_MAX_CACHE_TIME_MS,
        'DEFAULT_MAX_CACHE_TIME_MS',
      )
    })

    describe('check cache timeout', () => {
      ivNumber(
        'checkCacheTimeout',
        ['NLOGS_COUNT_CHECK_CACHE_TIMEOUT', 'NLOGS_ITEM_CHECK_CACHE_TIMEOUT'],
        DEFAULT_CHECK_CACHE_TIMEOUT_MS,
        'DEFAULT_CHECK_CACHE_TIMEOUT_MS',
      )
    })

    describe('max cache size', () => {
      ivNumber(
        'maxCacheSize',
        ['NLOGS_COUNT_MAX_CACHE_SIZE', 'NLOGS_ITEM_MAX_CACHE_SIZE'],
        DEFAULT_MAX_CACHE_SIZE,
        'DEFAULT_MAX_CACHE_SIZE',
      )
    })
  })
})
