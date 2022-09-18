import { Func, Paths } from './Paths'

export const DEFAULT_CATEGORY = 'default'

const allowedDebug: { module: string; category?: string }[] = [
  process.env.DEBUG,
  process.env.NODE_DEBUG,
  process.env.LOGGER_DEBUG,
  process.env.NLOGS_DEBUG,
]
  .filter(Boolean)
  .join(',')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(str => {
    const arr = str.split(':')
    const module = arr.shift()
    const cat = arr.join(':').trim()

    if (!module || ['*', '@'].includes(module)) return { module: '@' }
    if (!cat) return [{ module }, { module: '@', category: module }]
    if (cat === '*') return { module }
    return { module, category: cat }
  })
  .flat()

export type Cat = string | Func

export class Category {
  category: string
  name: string
  isModule: boolean
  constructor(paths: Paths, cat?: Cat) {
    if (cat) {
      if (typeof cat === 'string') {
        this.category = cat
      } else if (typeof cat === 'function') {
        this.category = cat.name
      } else {
        this.category = cat?.constructor?.name
      }
    }

    if (!this.category) this.category = paths.resolved
    if (!this.category) this.category = DEFAULT_CATEGORY
    this.name = paths.isModule ? (this.category === DEFAULT_CATEGORY ? paths.name : `${paths.name}:${this.category}`) : this.category
    this.isModule = paths.isModule

    if (
      (allowedDebug.length > 1 ||
        !(allowedDebug.length === 1 && allowedDebug.length === 1 && allowedDebug[0].module === '@' && !allowedDebug[0].category)) &&
      allowedDebug.find(({ module, category }) => {
        if (paths.isModule) return module === paths.name && (!category || category === this.category)
        return (!module || module === '@' || module === paths.rootName) && (!category || category === this.category)
      })
    ) {
      this.allow()
    }
  }

  set(name: string) {
    this.name = name
    return this
  }

  allow() {
    Category.allowedSet.add(this)
    return this
  }

  disallow() {
    Category.allowedSet.delete(this)
    return this
  }

  get allowed() {
    return Category.allowedSet.size ? Category.allowedSet.has(this) : !this.isModule
  }

  static DEFAULT = DEFAULT_CATEGORY
  static allowedSet = new Set<any>()
}