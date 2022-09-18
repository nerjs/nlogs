import { Base } from './Base'
import { AllowedSchema } from './types'
import { formatWithOptions } from 'util'
import {
  ALLOWED,
  CATEGORY,
  DATETIME,
  DEPTH,
  HIGHLIGHT,
  INDEX,
  LEVEL,
  META,
  PROJECT,
  SERVICE,
  STACKTRACE,
  TIME,
  TIMESTAMP,
  TRACE_ID,
} from './symbols'
import { DEFAULT_PROJECT } from '../constants'
import { DEFAULT_CATEGORY } from './Cetegory'
import { parseStackString } from '../helpers/stack'
import { objectToString, padTimeItem } from '../helpers/string'
import prettyTime from 'pretty-time'

/*

export const PROJECT = Symbol('nlogs(meta:project)')
export const SERVICE = Symbol('nlogs(meta:service)')
export const CATEGORY = Symbol('nlogs(meta:category)')
export const LEVEL = Symbol('nlogs(meta:level)')
export const TIMESTAMP = Symbol('nlogs(meta:timestamp)')
export const TRACE_ID = Symbol('nlogs(meta:traceId)')

export const DEPTH = Symbol('nlogs(meta:depth)')
export const INDEX = Symbol('nlogs(meta:index)')

export const ALLOWED = Symbol('nlogs(meta:allowed)')
export const SHOW = Symbol('nlogs(meta:show)')
export const WRITE = Symbol('nlogs(meta:write)')
export const SEND = Symbol('nlogs(meta:send)')
export const META = Symbol('nlogs(meta:object)')

*/

export type Meta = {
  project: string
  service: string
  category: string
  level: string
  traceId: string
  timestamp: Date

  [key: string]: any
}

export const META_MAPPING: { key: symbol; field: keyof Meta }[] = [
  { key: PROJECT, field: 'project' },
  { key: SERVICE, field: 'service' },
  { key: CATEGORY, field: 'category' },
  { key: LEVEL, field: 'level' },
  { key: TRACE_ID, field: 'traceId' },
  { key: TIMESTAMP, field: 'timestamp' },
]

export const META_ROOT_MAPPING: { key: symbol; field: keyof Meta }[] = [
  { key: DEPTH, field: 'depth' },
  { key: INDEX, field: 'index' },
]

export const COLORS = {
  debug: 'magenta',
  info: 'green',
  warn: 'yellow',
  error: 'red',
}

export class Parser {
  readonly allowed: AllowedSchema = {
    console: true,
    file: false,
    elasticsearch: false,
  }

  depth: number = 100
  index: string = 'nlogs-empty'

  meta: Meta = {
    project: DEFAULT_PROJECT,
    service: '',
    category: DEFAULT_CATEGORY,
    level: 'debug',
    traceId: '',
    timestamp: new Date(),
  }
  messages: any[] = []
  details: object

  get level() {
    return this.meta.level
  }

  get timestamp() {
    return this.meta.timestamp
  }

  parse(raw: any[]) {
    for (const msg of raw) {
      if (Base.isMeta(msg)) {
        this.setMeta(msg)
      } else if (!msg || Base.isMessage(msg) || typeof msg !== 'object' || Array.isArray(msg) || msg instanceof Date) {
        this.pushMessage(msg)
      } else if (msg instanceof Error) {
        this.parseError(msg)
      } else if (typeof msg === 'object') {
        this.mergeDetails(msg)
      } else {
        this.pushMessage(msg)
      }
    }
  }

  parseError(err: Error) {
    const { name, message, stack, ...obj } = err
    this.pushMessage(`${name}: ${message}`)
    this.pushMessage(Base.stacktrace(parseStackString(stack)))
    if (Object.keys(obj).length) this.mergeDetails(obj)
  }

  setMeta(meta: { [key: symbol]: any }) {
    for (const { key, field } of META_MAPPING) {
      if (meta[key]) {
        this.meta[field] = meta[key]
        return
      }
    }

    for (const { key, field } of META_ROOT_MAPPING) {
      if (meta[key]) {
        this[field] = meta[key]
        return
      }
    }

    if (meta[ALLOWED]) {
      Object.assign(this.allowed, meta[ALLOWED])
    } else if (meta[META]) {
      Object.assign(this.meta, meta[META], this.meta)
    }
  }

  pushMessage(msg: any) {
    this.messages.push(msg)
  }

  mergeDetails(obj: object) {
    if (!this.details) this.details = {}
    Object.assign(this.details, obj)
  }

  clone() {
    const parser = new Parser()
    Object.assign(parser, this)
    return parser
  }

  private getLevelColored() {
    const color = COLORS[this.level.toLowerCase()]
    const level = this.level.toUpperCase()
    if (!color) return level
    return level[color]
  }

  toConsole(): string {
    const messages = this.messages
      .filter(msg => !Base.isMessage(msg) || !msg[STACKTRACE])
      .map(msg => {
        if (!Base.isMessage(msg)) return `${msg}`
        if (msg[TIME] !== undefined) return `[${prettyTime(1000000 * msg[TIME], 'ms')}]`
        if (msg[HIGHLIGHT]) return `[${msg[HIGHLIGHT]}]`
        if (msg[DATETIME]) return msg[DATETIME]?.toJSON()
        return ''
      })

    if (this.details) messages.push(JSON.stringify(this.details))

    return [
      this.timestamp.toJSON(),
      '[',
      ...(this.meta.project !== DEFAULT_PROJECT ? [objectToString({ project: this.meta.project })] : []),
      objectToString({ service: this.meta.service, category: this.meta.category, level: this.meta.level.toUpperCase() }),
      ']',
      ...messages,
    ].join(' ')
  }

  toDevConsole(): string {
    const traces = []
    const messages = this.messages
      .filter(msg => {
        if (!Base.isMessage(msg) || !msg[STACKTRACE]) return true
        traces.push(msg[STACKTRACE])
        return false
      })
      .map(msg => {
        if (!Base.isMessage(msg)) return msg

        if (msg[HIGHLIGHT]) return `${msg[HIGHLIGHT]}`.bold
        if (msg[DATETIME]) {
          if (msg[DATETIME] instanceof Date) {
            if (isNaN(msg[DATETIME].getTime())) return msg[DATETIME]
            return msg[DATETIME].toLocaleString().replace(' ', '').magenta
          } else {
            return 'Invalid date'
          }
        }
        if (msg[TIME] !== undefined) return prettyTime(1000000 * msg[TIME], 'ms').yellow

        return ''
      })
    if (this.details) messages.push(this.details)
    if (traces.length) {
      messages.push('\n')
      messages.push(
        traces
          .map(tr => tr.join('\n\t'))
          .map(s => `${s}`.trimStart())
          .join('\n'),
      )
    }
    return formatWithOptions(
      {
        colors: true,
        depth: this.depth,
      },
      ...[
        `..${padTimeItem(this.timestamp.getHours(), 'h')}:${padTimeItem(this.timestamp.getMinutes(), 'm')}:${padTimeItem(
          this.timestamp.getSeconds(),
          's',
        )}.${padTimeItem(this.timestamp.getMilliseconds(), 'ms')}`.grey.bgBlack,
        '['.gray,
        this.meta.category.cyan.italic,
        this.getLevelColored(),
        ']:'.gray,
        ...messages,
      ],
    )
  }

  toFile(): string {
    let messages = this.messages.filter(msg => !Base.isMessage(msg) || !msg[STACKTRACE]).map(this.parseTextMsg)

    messages = messages.length ? [objectToString({ message: messages.join(' ') })] : []
    if (this.details) messages.push(`details=${JSON.stringify(this.details)}`)
    messages.push(`traceId=${this.meta.traceId}`)

    return [
      this.timestamp.toJSON(),
      '[',
      ...(this.meta.project !== DEFAULT_PROJECT ? [objectToString({ project: this.meta.project })] : []),
      objectToString({ service: this.meta.service, category: this.meta.category, level: this.meta.level.toUpperCase() }),
      ']',
      ...messages,
    ].join(' ')
  }

  toElasticsearch() {
    const stacks = []
    const messages = this.messages
      .filter(msg => {
        if (!Base.isMessage(msg) || !msg[STACKTRACE]) return true
        stacks.push(msg[STACKTRACE])
        return false
      })
      .map(this.parseTextMsg)

    let details: Record<string, any> = this.details ? { ...this.details } : undefined

    if (stacks.length) {
      if (!details) details = {}
      if (stacks.length === 1 && !details.stack) {
        details.stack = stacks[0]
      } else if (!details.stacks) {
        details.stacks = stacks
      } else {
        details.stacktraces = stacks
      }
    }

    return {
      meta: { ...this.meta },
      message: messages.join(' '),
      details,
    }
  }

  parseTextMsg(msg: any) {
    if (!Base.isMessage(msg)) {
      if (typeof msg === 'symbol') return msg.toString()
      return `${msg}`
    }

    if (msg[TIME] !== undefined) return `[${prettyTime(1000000 * msg[TIME], 'ms')}]`
    if (msg[HIGHLIGHT]) return `[${msg[HIGHLIGHT]}]`
    if (msg[DATETIME]) return msg[DATETIME]?.toJSON()
    return ''
  }
}
