import { randomUUID } from 'crypto'

export const uuid = () => randomUUID()

export const clearString = (base: string, ...patterns: (string | RegExp)[]): string => {
  let res = base
  for (const subs of patterns) res = res.replace(subs, '')
  return res
}

export const TRUE_VARIANTS = ['1', 'true', 'TRUE', 'yes', 'YES', 't', 'T', 'y', 'Y']
export const FALSE_VARIANTS = ['0', 'false', 'FALSE', 'no', 'NO', 'f', 'F', 'n', 'N']
export const stringToBoolean = (str?: string | undefined, def?: boolean) => {
  if (!str) return !!def
  if (TRUE_VARIANTS.includes(str)) return true
  if (FALSE_VARIANTS.includes(str)) return false
  return !!def
}

export const formatList = (list: string | number | (string | number)[]): string => {
  if (!Array.isArray(list)) return formatList([`${list}`])
  const nlist = [...list].map(str => `"${`${str}`.trim()}"`)
  if (!nlist.length) return ''
  if (nlist.length === 1) return nlist[0]

  const last = nlist.pop()

  return `${nlist.join(', ')} and ${last}`
}
