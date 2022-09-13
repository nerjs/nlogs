import 'colors'
import type { Category } from './Category'
import type { Base } from './Base'
import { objectToString, padTimeItem, warpBrackets } from '../utils/string'

export interface Meta extends Base {}
export class Meta {
  readonly timestamp = new Date(Date.now() - 1000 * 60 * 18)
  levels = {
    all: s => `${s}`,
    debug: s => `${s}`.magenta,
    info: s => `${s}`.green,
    warn: s => `${s}`.yellow,
    error: s => `${s}`.red,
  }
  constructor(
    private readonly base: Base,
    private readonly category: Category,
    readonly level: string,
    readonly sublevel?: string,
    readonly traceId?: string,
  ) {}

  private getLevelColored() {
    const fn = this.levels[this.level.toLowerCase()] || this.levels.all
    return `${fn(this.level.toUpperCase())}${this.sublevel ? `:${fn(this.sublevel).italic}` : ''}`
  }

  private toConsoleDev() {
    return [
      `..${padTimeItem(this.timestamp.getHours(), 'h')}:${padTimeItem(this.timestamp.getMinutes(), 'm')}:${padTimeItem(
        this.timestamp.getSeconds(),
        's',
      )}.${padTimeItem(this.timestamp.getMilliseconds(), 'ms')}`.grey.bgBlack,
      '['.gray,
      this.category.name.cyan.italic,
      this.getLevelColored(),
      ']:'.gray,
    ].join(' ')
  }

  private toConsoleProd() {
    return [
      warpBrackets(this.timestamp.toUTCString()),
      '[',
      this.base.service,
      warpBrackets(this.category.name),
      ']',
      this.traceId && `[${this.traceId}]`,
      `[${this.level.toUpperCase()}]:`,
      objectToString({
        sublevel: this.sublevel,
      }),
    ]
      .filter(Boolean)
      .join(' ')
  }

  toJSON() {
    const { project, service, version, loggerVersion, env } = this.base
    return Object.assign(
      {},
      { project, service, level: this.level, category: this.category.name, env, timestamp: this.timestamp.toJSON() },
      version && { version },
      loggerVersion && { loggerVersion },
      this.sublevel && { sublevel: this.sublevel },
      this.traceId && { traceId: this.traceId },
    )
  }

  toFile() {
    return [
      this.timestamp.toISOString(),
      '[',
      warpBrackets(this.base.project),
      this.base.service,
      warpBrackets(this.category.name),
      ']',
      this.traceId && `[${this.traceId}]`,
      `[${this.level.toUpperCase()}]:`,
      objectToString({
        project: this.base.project,
        service: this.base.service,
        category: this.category.name,
        level: this.level,
        sublevel: this.sublevel,
        traceId: this.traceId,
      }),
    ]
      .filter(Boolean)
      .join(' ')
  }

  toConsole() {
    return this.base.env === 'production' ? this.toConsoleProd() : this.toConsoleDev()
  }
}
