/* eslint-disable @typescript-eslint/no-unused-vars */

import { ILoggerEnv } from './utils/types'

namespace NodeJS {
  interface ProcessEnv extends ILoggerEnv {}
}
