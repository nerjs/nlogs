import { Console } from 'console'
import { Writable } from 'stream'
import { ILogger } from '../helpers/types'
import { IOutLogger } from './types'

export interface ConsoleOut extends ILogger {}
export class ConsoleOut implements IOutLogger {
  private console: Console

  constructor(stdout: Writable, stderr?: Writable) {
    this.console = new Console(stdout, stderr)
    ;['log', 'info', 'debug', 'warn', 'error'].forEach(key => {
      this[key] = this.console[key]
    })
  }
}
