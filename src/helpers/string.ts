import { randomUUID } from 'crypto'

export const uuid = () => randomUUID()

export const clearString = (base: string, ...patterns: (string | RegExp)[]): string => {
  let res = base
  for (const subs of patterns) res = res.replace(subs, '')
  return res
}

export const TRUE_VARIANTS = ['1', 'true', 'yes', 't', 'y']
export const FALSE_VARIANTS = ['0', 'false', 'no', 'f', 'n']
export const stringToBoolean = (str?: string | undefined, def?: boolean) => {
  if (!str) return !!def
  if (TRUE_VARIANTS.includes(str.trim().toLowerCase())) return true
  if (FALSE_VARIANTS.includes(str.trim().toLowerCase())) return false
  return !!def
}

export const toString = (value: any): string => {
  if (value instanceof Date) return value.toJSON()
  if (
    typeof value === 'string' ||
    typeof value === 'symbol' ||
    (value && typeof value === 'object' && 'toString' in value && typeof value.toString === 'function')
  )
    return value.toString().trim()
  return `${value}`.trim()
}

export const prettyValue = (value: any, wrap?: boolean): string => {
  const str = toString(value)
  const mw = /( |\s)/.test(str)
  return mw || wrap ? `"${str}"` : str
}

export const prettyArray = (arr: any[], wrap?: boolean, wrapItem?: boolean): string => {
  const list = arr.map(value => prettyValue(value, wrapItem)).join(', ')

  return wrap || arr.length ? `[${list}]` : list
}

export const prettyList = (list: any | any[], wrap?: boolean, wrapItem?: boolean): string => {
  if (!Array.isArray(list)) return prettyValue(list, wrapItem)
  return prettyArray(list, wrap, wrapItem)
}
