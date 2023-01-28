import { hostname } from 'os'
import { IAbstractBaseLoggerOptions } from './abstract.base.logger'
import {
  DEFAULT_CATEGORY,
  DEFAULT_DEBUG_LEVELS,
  DEFAULT_MODULE_DEBUG_LEVELS,
  DEFAULT_PROJECT,
  DEFAULT_SERVICE,
  DEFAULT_STRICT_LEVEL_RULES,
} from './constants'
import { stringToBoolean } from './helpers/string'

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
  LOGGER_DEFAULT_INDEX,
} = process.env

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
  NLOGS_LEVEL ||
  LOGGER_LEVEL ||
  LEVEL ||
  (NLOGS_LEVELS || LOGGER_LEVELS || LEVELS)
    ?.split(',')
    .map(str => str.trim())
    .filter(Boolean)

const isDev = NODE_ENV !== 'production'

const strictLevelRules = stringToBoolean(NLOGS_STRICT_LEVEL_RULES || LOGGER_STRICT_LEVEL_RULES, DEFAULT_STRICT_LEVEL_RULES)

const index = LOGGER_DEFAULT_INDEX

const hiddenDetails: Record<string, any> = {
  _node: {
    hostname: hostname(),
    env: NODE_ENV,
  },
}

const formatterType: 'json' | 'light' | 'dark' | 'string' =
  NLOGS_FORMATTER && ['json', 'light', 'dark', 'string'].includes(NLOGS_FORMATTER)
    ? NLOGS_FORMATTER
    : NODE_ENV === 'production'
    ? 'json'
    : 'dark'

const categoriesAllowedList: string | undefined =
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

const debugAllowedList: string | undefined = NLOGS_DEBUG || LOGGER_DEBUG || NODE_DEBUG || DEBUG

const defaultProject: string = NLOGS_PROJECT || LOGGER_PROJECT || PROJECT || DEFAULT_PROJECT
const defaultService: string = NLOGS_SERVICE || LOGGER_SERVICE || SERVICE || DEFAULT_SERVICE
const defaultCategory: string = DEFAULT_CATEGORY

export default {
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
