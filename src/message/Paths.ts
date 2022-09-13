import { getStackTrace } from '../utils/stack'
import { LOGGER_PATHNAME, ROOT_NAME, ROOT } from '../utils/package'
import { ClassType } from '../utils/types'
import { searchPackage } from '../utils/file'

const cache = new Map<string, string>()
const getModuleName = (pathname: string) => {
  if (cache.has(pathname)) return cache.get(pathname)
  const pkg = searchPackage(pathname)
  cache.set(pathname, pkg?.package?.name || `${ROOT_NAME}:??`)
  return cache.get(pathname)
}

export class Paths {
  readonly root = ROOT
  readonly rootName = ROOT_NAME
  readonly loggerPathname = LOGGER_PATHNAME
  readonly name: string
  readonly pathname: string
  readonly resolved: string
  readonly isModule: boolean

  constructor(parent?: ClassType | InstanceType<any>) {
    const stack = getStackTrace(parent?.constructor || (typeof parent === 'function' && parent) || this.constructor)[0]
    const fullPathname = stack?.replace(/^(.*)\((.*)\)/, '$2')?.replace(/([:0-9]+)$/, '')
    this.pathname = fullPathname?.replace(/((\/index)?\.(j|t)sx?)$/, '') || '..'

    const matched = this.pathname.match(/node_modules\/(@[a-z0-9-_]+\/)?([a-z0-9-_]+)/g)
    this.isModule = !this.pathname.includes(ROOT) || !!matched

    if (matched?.length) {
      this.name = matched[matched.length - 1].replace(/^node_modules\//, '')
    } else if (this.pathname.includes(ROOT)) {
      this.name = this.rootName
    } else {
      this.name = getModuleName(this.pathname)
    }

    if (this.pathname.includes(this.loggerPathname)) {
      this.resolved = this.pathname.replace(`${this.loggerPathname}/`, '')
    } else if (this.isModule) {
      this.resolved = this.pathname.match(new RegExp(`/node_modules/${this.name}/(.*)`))?.[1]
    } else if (this.pathname.includes(ROOT)) {
      this.resolved = this.pathname.match(new RegExp(`^${ROOT}/(.*)`))?.[1]
    }

    this.resolved = this.resolved?.replace(/^(dist|src)/, '')
    if (!this.resolved) this.resolved = ''
    Object.freeze(this)
  }
}
