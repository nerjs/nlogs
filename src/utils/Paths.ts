import { PROJECT, SERVICE } from '../constants'
import { getPackageName } from '../helpers/file'
import { LOGGER_PATHNAME, ROOT, ROOT_NAME } from '../helpers/package'
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
  readonly project = PROJECT
  readonly service = SERVICE
  readonly root = ROOT
  readonly rootName = ROOT_NAME
  readonly loggerPathname = LOGGER_PATHNAME
  readonly pathname: string
  readonly name: string
  readonly resolved: string
  readonly isModule: boolean
  constructor(parent?: string | Func) {
    this.pathname = typeof parent === 'string' ? parent : this.fromStack(parent)
    this.pathname = this.pathname?.replace(/((\/index)?\.(j|t)sx?)$/, '') || '..'

    const matched = this.pathname.match(/node_modules\/(@[a-z0-9-_]+\/)?([a-z0-9-_]+)/g)
    this.isModule = !this.pathname.includes(ROOT) || !!matched

    if (matched?.length) {
      this.name = matched[matched.length - 1].replace(/^node_modules\//, '')
    } else if (this.pathname.includes(ROOT)) {
      this.name = this.rootName
    } else {
      this.name = getPackageName(this.pathname)
    }

    if (this.pathname.includes(this.loggerPathname)) {
      this.resolved = this.pathname.replace(`${this.loggerPathname}/`, '')
    } else if (this.isModule) {
      this.resolved = this.pathname.match(new RegExp(`/node_modules/${this.name}/(.*)`))?.[1]
    } else if (this.pathname.includes(ROOT)) {
      this.resolved = this.pathname.match(new RegExp(`^${ROOT}/(.*)`))?.[1]
    }

    this.resolved = this.resolved?.replace(/^(dist|src)\/?/, '')
    if (!this.resolved) this.resolved = ''

    if (!this.service) this.service = this.rootName

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
