import { ILoggerEnv } from './utils/types'

namespace NodeJS {
  interface ProcessEnv extends ILoggerEnv {}
}
