import os from 'os'
import { join } from 'path'
import { stringToBoolean } from '../helpers/boolean'
import { APP_IN_DOCKER } from '../helpers/docker'
import { existsDir } from '../helpers/file'
import {
  DEFAULT_CATEGORY,
  DEFAULT_PROJECT,
  DEFAULT_SERVICE,
  LOGFILE_HISTORY_NAME,
  LOGFILE_MAX_FILES,
  LOGFILE_MAX_SIZE,
  LOGFILE_SIZE,
  LOGS_INDEX,
  LOGS_SYSTEM_INDEX,
  SYSTEM_CATEGORY,
} from './constants'
import { cfg, ENV } from './createCfg'
import { LOGGER_PATHNAME, LOGGER_VERSION, ROOT, ROOT_NAME, ROOT_VERSION } from './rootInfo'
import { Config } from './types'

const config: Config = {
  main: {
    project: cfg.PROJECT || DEFAULT_PROJECT,
    service: cfg.SERVICE || ROOT_NAME || DEFAULT_SERVICE,
    category: {
      default: cfg.CATEGORY || DEFAULT_CATEGORY,
      system: SYSTEM_CATEGORY,
    },
    env: ENV,
    index: {
      logs: cfg.INDEX || LOGS_INDEX,
      system: cfg.SYSTEM_INDEX || LOGS_SYSTEM_INDEX,
    },
    logger: {
      version: LOGGER_VERSION,
      pathname: LOGGER_PATHNAME,
    },
    root: {
      name: ROOT_NAME,
      pathname: ROOT,
      version: ROOT_VERSION,
    },
  },
  console: {
    allowed: true,
    config: {
      format:
        cfg.CONSOLE_FORMAT && ['full', 'simple', 'json'].includes(cfg.CONSOLE_FORMAT)
          ? cfg.CONSOLE_FORMAT
          : ENV === 'development'
          ? 'full'
          : 'simple',
      levels: ['log', 'debug', 'info', 'warn', 'error'],
    },
    debug: {
      allowed: ENV === 'development',
      only: false,
      categories: [],
      modules: [],
    },
  },
  file: {
    allowed: cfg.FILE ? stringToBoolean(cfg.FILE) : (cfg.FILE_PATH && existsDir(cfg.FILE_PATH)) || ENV === 'production',
    debug: {
      allowed: cfg.FILE_DEBUG ? stringToBoolean(cfg.FILE_DEBUG) : false,
      only: false,
      categories: [],
      modules: [],
    },
    config: {
      compress: true,
      history: LOGFILE_HISTORY_NAME,
      maxFiles: +cfg.FILE_MAX_FILES || LOGFILE_MAX_FILES,
      size: cfg.FILE_SIZE || LOGFILE_SIZE,
      maxSize: cfg.FILE_MAX_SIZE || LOGFILE_MAX_SIZE,
      omitExtension: true,
      path:
        cfg.FILE_PATH ||
        (APP_IN_DOCKER
          ? existsDir('/var/log')
            ? '/var/log'
            : '/logs'
          : ENV === 'development'
          ? join(ROOT, 'logs')
          : join(os.homedir(), '.config', 'log')),
    },
  },
  elasticsearch: {
    allowed: !!(
      cfg.ELASTICSEARCH_NODE ||
      cfg.ELASTICSEARCH_NODES ||
      (cfg.ELASTICSEARCH_CLOUD_ID && (cfg.ELASTICSEARCH_API_KEY || (cfg.ELASTICSEARCH_USERNAME && cfg.ELASTICSEARCH_PASSWORD)))
    ),
    debug: {
      allowed: true,
      only: false,
      categories: [],
      modules: [],
    },
    config: Object.assign(
      {},
      cfg.ELASTICSEARCH_NODE && { node: cfg.ELASTICSEARCH_NODE },
      cfg.ELASTICSEARCH_NODES && { nodes: cfg.ELASTICSEARCH_NODES },
      cfg.ELASTICSEARCH_CLOUD_ID && { cloud: { id: cfg.ELASTICSEARCH_CLOUD_ID } },
      (cfg.ELASTICSEARCH_API_KEY || cfg.ELASTICSEARCH_USERNAME || cfg.ELASTICSEARCH_PASSWORD) && {
        auth: Object.assign(
          {},
          cfg.ELASTICSEARCH_API_KEY && { apiKey: cfg.ELASTICSEARCH_API_KEY },
          cfg.ELASTICSEARCH_USERNAME && { username: cfg.ELASTICSEARCH_USERNAME },
          cfg.ELASTICSEARCH_PASSWORD && { password: cfg.ELASTICSEARCH_PASSWORD },
        ),
      },
    ),
  },
  meta: {},
}

export { config }
