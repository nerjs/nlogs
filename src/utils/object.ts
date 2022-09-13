export const iterateKeys = (keyPath: string | string[], obj: object, fn: (key: string, target: object) => void) => {
  if (typeof keyPath === 'string') return iterateKeys(keyPath.split('.'), obj, fn)
  if (!obj || typeof obj !== 'object' || !keyPath.length) return
  const [first, ...keys] = keyPath
  if (!Object.hasOwnProperty.call(obj, first)) return
  if (!keys.length) {
    fn(first, obj)
    return
  }

  if (typeof obj[first] !== 'object') return
  return iterateKeys(keys, obj[first], fn)
}
