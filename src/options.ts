import { hostname } from 'os'
import { IAbstractBaseLoggerOptions } from './abstract.base.logger'
import {
  DEFAULT_CATEGORY,
  DEFAULT_CHECK_CACHE_TIMEOUT_MS,
  DEFAULT_DEBUG_ALLOWED_LIST,
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
} from './constants'
import { stringToBoolean } from './helpers/string'
import { ILoggerEnv } from './utils/types'

const {
  NLOGS_PROJECT,
  LOGGER_PROJECT,
  PROJECT,
  NLOGS_SERVICE,
  LOGGER_SERVICE,
  SERVICE,
  NLOGS_CATEGORY,
  LOGGER_CATEGORY,
  SHOW_CATEGORY,
  ALLOWED_CATEGORY,
  CATEGORY,
  NLOGS_CATEGORIES,
  LOGGER_CATEGORIES,
  SHOW_CATEGORIES,
  ALLOWED_CATEGORIES,
  CATEGORIES,
  NLOGS_DEBUG,
  LOGGER_DEBUG,
  NODE_DEBUG,
  DEBUG,
  NLOGS_FORMATTER,
  LOGGER_FORMATTER,
  NODE_ENV,
  NLOGS_DEBUG_LEVELS,
  DEBUG_LEVELS,
  NLOGS_MODULE_DEBUG_LEVELS,
  MODULE_DEBUG_LEVELS,
  NLOGS_LEVELS,
  LOGGER_LEVELS,
  LEVELS,
  NLOGS_LEVEL,
  LOGGER_LEVEL,
  LEVEL,
  NLOGS_STRICT_LEVEL_RULES,
  LOGGER_STRICT_LEVEL_RULES,
  NLOGS_DEFAULT_INDEX,
  LOGGER_DEFAULT_INDEX,
  NLOGS_ITEM_MAX_CACHE_TIME,
  NLOGS_TIME_MAX_CACHE_TIME,
  NLOGS_COUNT_MAX_CACHE_TIME,
  NLOGS_ITEM_CHECK_CACHE_TIMEOUT,
  NLOGS_TIME_CHECK_CACHE_TIMEOUT,
  NLOGS_COUNT_CHECK_CACHE_TIMEOUT,
  NLOGS_ITEM_MAX_CACHE_SIZE,
  NLOGS_TIME_MAX_CACHE_SIZE,
  NLOGS_COUNT_MAX_CACHE_SIZE,
  NLOGS_TIME_LOG_ON_START,
} = process.env as ILoggerEnv

const debugLevels: IAbstractBaseLoggerOptions['debugLevels'] =
  (NLOGS_DEBUG_LEVELS || DEBUG_LEVELS)
    ?.split(',')
    .map(str => str.trim())
    .filter(Boolean) || DEFAULT_DEBUG_LEVELS

const moduleDebugLevels: IAbstractBaseLoggerOptions['moduleDebugLevels'] =
  (NLOGS_MODULE_DEBUG_LEVELS || MODULE_DEBUG_LEVELS)
    ?.split(',')
    .map(str => str.trim())
    .filter(Boolean) || DEFAULT_MODULE_DEBUG_LEVELS

const allowedLevels: IAbstractBaseLoggerOptions['allowedLevels'] =
  (NLOGS_LEVEL || LOGGER_LEVEL || LEVEL)?.trim() ||
  (NLOGS_LEVELS || LOGGER_LEVELS || LEVELS)
    ?.split(',')
    .map(str => str.trim())
    .filter(Boolean)

const isDev = NODE_ENV !== 'production'

const strictLevelRules = stringToBoolean(NLOGS_STRICT_LEVEL_RULES || LOGGER_STRICT_LEVEL_RULES, DEFAULT_STRICT_LEVEL_RULES)

const index = NLOGS_DEFAULT_INDEX || LOGGER_DEFAULT_INDEX

const hiddenDetails: Record<string, any> = {
  _node: {
    hostname: hostname(),
    env: NODE_ENV,
  },
}

const formatterType: 'json' | 'light' | 'dark' | 'string' =
  NLOGS_FORMATTER && ['json', 'light', 'dark', 'string'].includes(NLOGS_FORMATTER)
    ? NLOGS_FORMATTER
    : LOGGER_FORMATTER && ['json', 'light', 'dark', 'string'].includes(LOGGER_FORMATTER)
    ? LOGGER_FORMATTER
    : NODE_ENV === 'production'
    ? PRODUCTION_FORMATTER
    : DEFAULT_FORMATTER

// :

const categoriesAllowedList: string | undefined = (
  NLOGS_CATEGORY ||
  LOGGER_CATEGORY ||
  SHOW_CATEGORY ||
  ALLOWED_CATEGORY ||
  CATEGORY ||
  NLOGS_CATEGORIES ||
  LOGGER_CATEGORIES ||
  SHOW_CATEGORIES ||
  ALLOWED_CATEGORIES ||
  CATEGORIES
)?.trim()

let debugAllowedList: string | undefined = (NLOGS_DEBUG || LOGGER_DEBUG || NODE_DEBUG || DEBUG)?.trim()
if (debugAllowedList == null) debugAllowedList = DEFAULT_DEBUG_ALLOWED_LIST

const defaultProject: string = (NLOGS_PROJECT || LOGGER_PROJECT || PROJECT)?.trim() || DEFAULT_PROJECT
const defaultService: string = (NLOGS_SERVICE || LOGGER_SERVICE || SERVICE)?.trim() || DEFAULT_SERVICE
const defaultCategory: string = DEFAULT_CATEGORY

export const loggerOptions = {
  debugLevels,
  moduleDebugLevels,
  allowedLevels,
  hiddenDetails,
  isDev,
  strictLevelRules,
  index,
  formatterType,
  categoriesAllowedList,
  debugAllowedList,
  defaultProject,
  defaultService,
  defaultCategory,
}

// ITEMS OPTIONS

const maxCacheTime = +NLOGS_ITEM_MAX_CACHE_TIME || DEFAULT_MAX_CACHE_TIME_MS
const checkCacheTimeout = +NLOGS_ITEM_CHECK_CACHE_TIMEOUT || DEFAULT_CHECK_CACHE_TIMEOUT_MS
const maxCacheSize = +NLOGS_ITEM_MAX_CACHE_SIZE || DEFAULT_MAX_CACHE_SIZE

export const timesOptions = {
  maxCacheTime: +NLOGS_TIME_MAX_CACHE_TIME || maxCacheTime,
  checkCacheTimeout: +NLOGS_TIME_CHECK_CACHE_TIMEOUT || checkCacheTimeout,
  maxCacheSize: +NLOGS_TIME_MAX_CACHE_SIZE || maxCacheSize,
  logOnStart: stringToBoolean(NLOGS_TIME_LOG_ON_START, DEFAULT_LOG_ON_START),
}

export const countOptions = {
  maxCacheTime: +NLOGS_COUNT_MAX_CACHE_TIME || maxCacheTime,
  checkCacheTimeout: +NLOGS_COUNT_CHECK_CACHE_TIMEOUT || checkCacheTimeout,
  maxCacheSize: +NLOGS_COUNT_MAX_CACHE_SIZE || maxCacheSize,
}
