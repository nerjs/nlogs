import { LOGGER_VERSION, ROOT_NAME, ROOT_VERSION } from '../utils/package'

export const DEFAULT_PROJECT = 'main'
export const DEFAULT_SERVICE = 'default'

export class Base {
  readonly project = process.env.NLOGS_PROJECT || process.env.LOGGER_PROJECT || process.env.PROJECT || DEFAULT_PROJECT
  readonly service = process.env.NLOGS_SERVICE || process.env.LOGGER_SERVICE || ROOT_NAME || DEFAULT_SERVICE
  readonly version = ROOT_VERSION
  readonly loggerVersion = LOGGER_VERSION
  readonly env = process.env.NODE_ENV || 'development'

  constructor() {
    Object.freeze(this)
  }
}
