import { Logger } from './logger'

export class NestjsLogger {
  private readonly logger = new Logger(this)

  private parseMessages(msgs: any[]) {
    if (msgs.length < 2 || typeof msgs.at(-1) !== 'string') return msgs
    const last = msgs.pop()

    return [...msgs, Logger.category(last), Logger.module('nestjs')]
  }

  log(...msgs: any[]) {
    this.logger.log(...this.parseMessages(msgs))
  }

  error(...msgs: any[]) {
    this.logger.error(...this.parseMessages(msgs))
  }

  warn(...msgs: any[]) {
    this.logger.warn(...this.parseMessages(msgs))
  }

  debug(...msgs: any[]) {
    this.logger.debug(...this.parseMessages(msgs))
  }
}
