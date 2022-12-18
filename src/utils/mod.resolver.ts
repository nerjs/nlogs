import { readFileSync } from 'fs'
import { dirname } from 'path'
import { createDebug } from '../helpers/debug'
import { searchFileRecursive } from '../helpers/fs'
import { Mod } from './mod'

const debug = createDebug('mod')
const PACKAGE_JSON = 'package.json'
const NODE_MODULES = 'node_modules'

export class ModResolver {
  #modules = new Map<string, Mod | null>()
  get modules() {
    return this.#modules
  }

  #app: Mod
  get app() {
    if (this.#app !== undefined) return this.#app
    this.#app = this.findApp()
    this.#modules.set(this.#app.pathname, this.#app)
    return this.#app
  }

  resolve(pathname: string): Mod {
    const saved = this.#modules.get(pathname)
    if (saved) return saved
    if (!saved && this.#modules.has(pathname)) return this.app
    const cached = this.resolveCached(pathname)
    if (cached) {
      this.#modules.set(pathname, cached)
      return cached
    }

    const finded = this.findModule(pathname)
    if (!finded || finded.id === this.app.id) {
      this.#modules.set(pathname, this.app)
      return this.app
    }

    this.#modules.set(pathname, finded)
    return finded
  }

  private findApp() {
    debug('find app')
    const app = this.findPackage(process.cwd(), 'app')
    if (app) return app
    return this.createEmptyModule(process.cwd(), 'app')
  }

  private findPackage(pathname: string, type: 'app' | 'module'): Mod | null {
    try {
      const pkgPathname = searchFileRecursive(pathname, PACKAGE_JSON)
      debug(`Find package "${pathname}". package=${pkgPathname}`)
      if (pkgPathname) {
        const pkg = JSON.parse(readFileSync(pkgPathname, 'utf-8'))
        const deps = new Set<string>()
        Object.entries(Object.assign({}, pkg.dependencies, pkg.devDependencies)).forEach(([name, version]) => {
          const id = `${name}@${`${version}`.replace(/^\^/, '')}`
          deps.add(id)
        })
        return new Mod(type, pkg.name, pkg.version, dirname(pkgPathname), deps)
      }

      return null
    } catch (err) {
      if (process.env.NLOGS_CONSISTENCY_CHECK) throw err
      else debug(err)
      return null
    }
  }

  private resolveCached(pathname: string): Mod | null {
    const key = [...this.#modules.keys()].find(spath => this.includePath(spath, pathname))
    if (key) debug(`Resolve cache key "${key}"`)
    return (key && this.#modules.get(key)) || null
  }

  private findModule(pathname: string): Mod | null {
    debug(`Find module by pathname=${pathname}`)
    if (this.includePath(this.app.pathname, pathname)) return this.app
    return this.findPackage(pathname, 'module')
  }

  private includePath(base: string, pathname: string): boolean {
    return pathname.includes(base) && !pathname.replace(base, '').includes(NODE_MODULES)
  }

  private createEmptyModule(pathname: string, type: 'module' | 'app' = 'module') {
    debug(`Create empty module by pathname="${pathname}"`)
    return new Mod(type, process.env.npm_package_name || 'app', process.env.npm_package_version || '1.0.0', pathname, new Set())
  }
}
