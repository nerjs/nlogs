import { config } from '../config'
import { getPackageName } from '../helpers/file'
import { getStackTrace } from '../helpers/stack'

export interface ClassWithConstructor {
  readonly name?: string
  new (...args: any): any
}

export type WithConstructor = {
  constructor: Function
}

export type Func = Function | ClassWithConstructor | WithConstructor

export class Paths {
  readonly project = config.main.project
  readonly service = config.main.service
  readonly pathname: string
  readonly name: string
  readonly resolved: string
  readonly isModule: boolean
  constructor(parent?: string | Func) {
    this.pathname = typeof parent === 'string' ? parent : this.fromStack(parent)
    this.pathname = this.pathname?.replace(/((\/index)?\.(j|t)sx?)$/, '') || '..'

    const matched = this.pathname.match(/node_modules\/(@[a-z0-9-_]+\/)?([a-z0-9-_]+)/g)
    this.isModule = !this.pathname.includes(config.main.root.pathname) || !!matched

    if (matched?.length) {
      this.name = matched[matched.length - 1].replace(/^node_modules\//, '')
    } else if (this.pathname.includes(config.main.root.pathname)) {
      this.name = config.main.root.name
    } else {
      this.name = getPackageName(this.pathname)
    }

    if (this.pathname.includes(config.main.logger.pathname)) {
      this.resolved = this.pathname.replace(`${config.main.logger.pathname}/`, '')
    } else if (this.isModule) {
      this.resolved = this.pathname.match(new RegExp(`/node_modules/${this.name}/(.*)`))?.[1]
    } else if (this.pathname.includes(config.main.root.pathname)) {
      this.resolved = this.pathname.match(new RegExp(`^${config.main.root.pathname}/(.*)`))?.[1]
    }

    this.resolved = this.resolved?.replace(/^(dist|src)\/?/, '')
    if (!this.resolved) this.resolved = ''

    Object.freeze(this)
  }

  private fromStack(parent: Func) {
    const fn = typeof parent === 'function' ? parent : parent?.constructor || this.constructor
    const stack = getStackTrace(fn)

    const pathname = stack
      .map(s => `${s}`.trim())
      .filter(s => s.startsWith('at'))
      .filter(s => !s.includes(__filename))[0]
      ?.replace(/^(.*)\((.*)\)/, '$2')
      ?.replace(/([:0-9]+)$/, '')

    return pathname || process.cwd()
  }
}
