export const APP = '@'
export const MODULE = '$'
export const ALL = '*'
export const SPECIAL_DELIMITER = ':'
export const DELIMITER = ','
export const NEGATION = '!'

export class AllowedList {
  private allowedList = new Map<string, Set<string>>()
  private deniedList = new Map<string, Set<string>>()

  constructor(raw?: string, delimiter: string = DELIMITER) {
    ;(raw || '')
      .split(delimiter)
      .map(str => str.trim())
      .filter(Boolean)
      .forEach(str => this.parseStringItem(str))
  }

  allow(category: string, module?: string | false): boolean {
    if (!this.allowedList.size && !this.deniedList.size) return true
    if (module) return this.allowModule(category, module)
    return this.allowApp(category)
  }

  private allowApp(category: string): boolean {
    if (!this.allowedList.has(APP)) return false

    return !!this.checkCategory(category, APP)
  }

  private allowModule(category: string, moduleName: string) {
    if (!this.allowedList.has(moduleName) && !this.allowedList.has(MODULE)) return false

    const allowedByModule = this.checkCategory(category, moduleName)
    if (allowedByModule != null) return allowedByModule

    return !!this.checkCategory(category, MODULE)
  }

  private checkCategory(category: string, moduleName: string): boolean | null {
    const appAllowed = this.allowedList.get(moduleName)
    if (appAllowed?.has(category)) return true

    const appDenied = this.deniedList.get(moduleName)
    if (appDenied?.has(category)) return false

    if (appAllowed?.has(ALL)) return true
    if (appDenied?.has(ALL)) return false

    return null
  }

  private parseStringItem(str: string) {
    const isNegation = str.startsWith(NEGATION)
    const arr = str.split(SPECIAL_DELIMITER).map(s => s.trim())
    //   .filter(Boolean)
    if (isNegation) arr[0] = arr[0].slice(1)
    if (!arr[0] && arr.length === 1) return this.parseStringItem(`${NEGATION}${SPECIAL_DELIMITER}${ALL}`)
    if (!arr[0]) return this.parseStringItem(`${isNegation ? NEGATION : ''}${arr[1]}`)

    const list = isNegation ? this.deniedList : this.allowedList

    if (arr.length === 1 && arr[0] === ALL) {
      if (!list.has(APP)) list.set(APP, new Set())
      if (!list.has(MODULE)) list.set(MODULE, new Set())

      list.get(APP).add(ALL)
      list.get(MODULE).add(ALL)
    } else if (arr.length === 1) {
      if (!list.has(APP)) list.set(APP, new Set())
      list.get(APP).add(arr[0])

      if (!list.has(arr[0])) list.set(arr[0], new Set())
      list.get(arr[0]).add(ALL)
    } else {
      if (!list.has(arr[0])) list.set(arr[0], new Set())
      list.get(arr[0]).add(arr[1])
    }
  }
}
