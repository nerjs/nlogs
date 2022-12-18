import { isMeta } from './symbols'

type Template = [a: TemplateStringsArray, ...b: any[]]

const isTemplateStringsArray = (arr: any): arr is TemplateStringsArray =>
  arr && Array.isArray(arr) && 'raw' in arr && Array.isArray((arr as TemplateStringsArray).raw) && Object.isFrozen(arr)

const isTemplate = (args: any): args is Template =>
  args && Array.isArray(args) && isTemplateStringsArray(args[0]) && args[0].length === args.length

export const interleave = (strings: readonly string[], interpolations: any[]): any[] => {
  const result: any[] = [strings[0]]

  for (let i = 0, len = interpolations.length; i < len; i += 1) {
    result.push(interpolations[i], strings[i + 1])
  }

  return result
}

export const transformTemplate = ([tmp, ...args]: Template) => {
  const arr = interleave(tmp, args)

  const { messages, meta } = arr.reduce(
    (acc, cur, idx) => {
      if (!isMeta(cur)) {
        acc.messages.push(cur)
        return acc
      }

      acc.meta.push(cur)

      const prevIdx = acc.messages.length - 1
      const nextIdx = idx + 1

      if (prevIdx >= 0 && typeof acc.messages[prevIdx] === 'string') {
        acc.messages[prevIdx] = acc.messages[prevIdx].replace(/ +$/, '')
      }

      if (nextIdx < arr.length && typeof arr[nextIdx] === 'string') {
        arr[nextIdx] = arr[nextIdx].replace(/^\n/, '')
      }

      return acc
    },
    { messages: [], meta: [] },
  )

  return [...messages, ...meta]
}

export const maybeTemplate = (data: any[]) => {
  if (isTemplate(data)) return transformTemplate(data)
  return data
}
