import { CatNlogsError } from '../errors/cat.nlogs.error'
import { getTopStackFile } from '../helpers/stack'
import { clearString } from '../helpers/string'

type IClassType = abstract new (...args: any) => any

abstract class A {}
type Instance = InstanceType<typeof A>

interface IModule {
  filename: string
}

interface IImportMeta {
  url: string
}

export type Cat = IClassType | Instance | IModule | IImportMeta | string | Category

interface IModCat {
  id: string
  pathname: string
}

export class Category {
  readonly name: string

  constructor(mod: IModCat, category?: Cat) {
    this.name = Category.category(category || Category.module(this, mod), mod)
  }

  static category(cat: Cat, mod: IModCat): string {
    if (typeof cat === 'string') return cat
    if (typeof cat === 'function' || cat instanceof Category) return cat.name
    if (typeof cat !== 'object') throw new CatNlogsError(`Incoreect category name of type ${typeof cat}`)
    if ('filename' in cat) return this.relativePath(cat.filename, mod)
    if ('url' in cat) return this.relativePath(cat.url, mod)
    if ('constructor' in cat && cat.constructor !== Object) return this.category(cat.constructor, mod)
    return mod.id
  }

  static module(cat: Category, mod: IModCat): string {
    const filename = getTopStackFile(cat.constructor)
    return filename ? this.relativePath(filename, mod) : mod.id
  }

  static relativePath(pathname: string, mod: IModCat) {
    if (!pathname) return mod.id
    if (!pathname.includes(mod.pathname)) return pathname
    return clearString(pathname, /^file:\/\//, mod.pathname, /^\//, /^src\//, /^build\//, /^dist\//)
  }
}
