const ALL = '*'
const MAIN = '@'

interface IModAL {
  type: 'app' | 'module'
  name: string
}

export class CategoriesAllowedList {
  private allowedList = new Map<string, Set<string>>()
  constructor(raw: string, delimiter: string = ',') {
    ;(raw || '')
      .split(delimiter)
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(str => this.parseStringItem(str))
  }

  allow(category: string, mod: IModAL): boolean {
    if (!this.allowedList.size) return true
    const all = this.allowedList.get(ALL)
    if (all && (all.has(category) || all.has(ALL))) return true

    if (mod.type === 'app') {
      const main = this.allowedList.get(MAIN)
      if (main && (main.has(ALL) || main.has(category))) return true
    }

    const mods = this.allowedList.get(mod.name)
    if (mods && (mods.has(ALL) || mods.has(category))) return true

    return false
  }

  private parseStringItem(str: string) {
    const arr = str.split(':')
    const module = arr.shift().trim()
    const cat = arr.join(':').trim()
    if (!module && !cat) return

    this.parseItem(module, cat)
  }

  private parseItem(module?: string, category?: string) {
    if (!category) {
      this.parseItem(MAIN, module)
      this.parseItem(module, ALL)
      return
    }
    const categories = this.allowedList.get(module) || new Set()
    categories.add(category)
    this.allowedList.set(module, categories)
  }
}
