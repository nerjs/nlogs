import { CatNlogsError } from '../errors/cat.nlogs.error'
import { createDebug } from '../helpers/debug'
import { getTopStackFile } from '../helpers/stack'
import { clearString } from '../helpers/string'

const debug = createDebug('category')

type IClassType = abstract new (...args: any) => any

abstract class A {}
type Instance = InstanceType<typeof A>

interface IModule {
  filename: string
}

interface IImportMeta {
  url: string
}

export type Cat = IClassType | Instance | IModule | IImportMeta | string

interface IModCat {
  id: string
  pathname: string
}

export class Category {
  readonly name: string
  #enabled: boolean = true
  get enabled() {
    return this.#enabled
  }

  constructor(mod: IModCat, category?: Cat) {
    this.name = Category.category(category || Category.module(this, mod), mod)

    debug(`Created category "${this.name}". start enabled - ${this.enabled}`)
  }

  enable() {
    debug(`Enable category "${this.name}"`)
    this.#enabled = true
  }

  disable() {
    debug(`Disable category "${this.name}"`)
    this.#enabled = false
  }

  static category(cat: Cat, mod: IModCat): string {
    debug(`Parse category name. type=${typeof cat}, value="${cat}"`)
    if (typeof cat === 'string') return cat
    if (typeof cat === 'function') return cat.name
    if (typeof cat !== 'object') throw new CatNlogsError(`Incoreect category name of type ${typeof cat}`)
    if ('filename' in cat) return this.relativePath(cat.filename, mod)
    if ('url' in cat) return this.relativePath(cat.url, mod)
    if ('constructor' in cat && cat.constructor !== Object) return this.category(cat.constructor, mod)
    return mod.id
  }

  static module(cat: Category, mod: IModCat): string {
    debug(`Find relative pathname by module ${mod.id} for category name`)
    const filename = getTopStackFile(cat.constructor)
    return filename ? this.relativePath(filename, mod) : mod.id
  }

  static relativePath(pathname: string, mod: IModCat) {
    debug(`Find the category name for the path "${pathname}" relative to the path "${mod.pathname}"(${mod.id})`)
    if (!pathname) return mod.id
    if (!pathname.includes(mod.pathname)) return pathname
    return clearString(pathname, /^file:\/\//, mod.pathname, /^\//, /^src\//, /^build\//, /^dist\//)
  }
}
