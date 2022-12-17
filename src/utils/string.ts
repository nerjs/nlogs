import { randomUUID } from 'crypto'

export const uuid = () => randomUUID()

export const clearString = (base: string, ...patterns: (string | RegExp)[]): string => {
  let res = base
  for (const subs of patterns) res = res.replace(subs, '')
  return res
}
