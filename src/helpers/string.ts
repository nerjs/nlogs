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

export const formatList = (list: boolean | string | number | (string | number)[]): string => {
  if (typeof list === 'boolean') return formatList(`${list}`.toUpperCase())
  if (!Array.isArray(list)) return formatList([`${list}`])
  const nlist = [...list].map(val => (typeof val === 'boolean' ? `${val}`.toUpperCase() : val)).map(str => `"${`${str}`.trim()}"`)
  if (!nlist.length) return ''
  if (nlist.length === 1) return nlist[0]

  const last = nlist.pop()

  return `${nlist.join(', ')} and ${last}`
}
