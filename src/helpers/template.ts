import { Base } from '../utils/Base'

type RO = ReadonlyArray<string> & { raw?: ReadonlyArray<string> }

type TemplateArray = [a: RO, ...b: any[]]

const isTemplate = (args: TemplateArray | any[]): boolean =>
  args[0] &&
  Array.isArray(args[0]) &&
  args[0].length === args.length &&
  Object.isFrozen(args[0]) &&
  (args[0] as RO).raw &&
  Array.isArray((args[0] as RO).raw) &&
  args[0].length === (args[0] as RO).raw.length

const transformTemplate = (args: TemplateArray): any[] => {
  const values = [...args]
  const temp: string[] = values[0]

  const { messages, meta } = temp.reduce(
    (acc, cur, idx) => {
      if (idx === 0) return { ...acc, messages: [cur] }
      const val = values[idx]

      if (!Base.isMeta(val)) {
        acc.messages.push(val, cur)
        return acc
      }

      const lastIdx = acc.messages.length - 1
      const last = acc.messages[lastIdx]

      if (typeof last === 'string') {
        acc.messages[lastIdx] = last.replace(/ +$/, '')
        if (!acc.messages[lastIdx]) acc.messages.pop()
      }

      const ccur = cur.replace(/^\n/, '')
      if (ccur) acc.messages.push(ccur)

      acc.meta.push(val)

      return acc
    },
    { messages: [], meta: [] },
  )

  return [...messages, ...meta]
}

export const parseTemplate = (args: any[] | TemplateArray): any[] => {
  if (isTemplate(args)) return transformTemplate(args as TemplateArray)
  return args
}
