export const stringToBoolean = (str: string): boolean => {
  const parsed = `${str}`.trim()
  if (!parsed) return false
  return ['true', 'True', 'TRUE', '1'].includes(parsed)
}
