import { randomUUID } from 'crypto'

export const uuid = () => randomUUID()

export const clearString = (base: string, ...patterns: (string | RegExp)[]): string => {
  let res = base
  for (const subs of patterns) res = res.replace(subs, '')
  return res
}

export const stringToBoolean = (str?: string | undefined, def?: boolean) => {
  if (!str) return !!def
  if (['1', 'true', 'TRUE', 'yes', 'YES', 't', 'T', 'y', 'Y'].includes(str)) return true
  if (['0', 'false', 'FALSE', 'no', 'NO', 'f', 'F', 'n', 'N'].includes(str)) return false
  return !!def
}
