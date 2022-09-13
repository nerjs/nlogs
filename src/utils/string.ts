export const warpBrackets = (str: string, definitely?: boolean) => (definitely || /(\s|=|,)/.test(str) ? `"${str}"` : str)

export const padTimeItem = (item: number, type: 'h' | 'm' | 's' | 'ms') => {
  const str = `${item}`
  return type === 'ms' ? str.padEnd(3, '0') : str.padStart(2, '0')
}

export const objectToString = (obj: object) =>
  Object.entries(obj)
    .filter(([, val]) => !!val)
    .map(([key, value]) => `${key}=${warpBrackets(`${value}`)}`)
    .join(', ')
