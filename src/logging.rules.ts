export const LEVELS = {
  trace: 1,
  debug: 2,
  log: 3,
  info: 4,
  warn: 5,
  error: 6,
  fatal: 7,
} as const

export const FATAL = 'fatal'
export const OFF = 'off'
export const STANDART_LEVELS = Object.keys(LEVELS).filter(level => level !== FATAL)
export type StandartLevels = keyof typeof LEVELS
export type Level = StandartLevels | string

export interface LoggingRules {
  level: string
  debugLevels: string[]
  moduleDebugLevels: string[]
  allowedLevels?: string | string[] | null
  isModule?: boolean | null
  isDev?: boolean | null
  showDebug?: boolean | null
  showCategory?: boolean | null
  showLogger?: boolean | null
  showLog?: boolean | null
}

export function loggingRules(rules: LoggingRules) {
  if (rules.showLog != null) return logRules(rules.showLog, { ...rules, showLog: null })
  if (rules.showLogger != null) return logRules(rules.showLogger, { ...rules, showLogger: null })
  if (rules.level.toLowerCase() === FATAL) return true
  if (rules.showCategory === false) return disabledCategory(rules.level)
  if (rules.allowedLevels != null) {
    if (typeof rules.allowedLevels === 'string') return stringAllowedLevel(rules as any)
    if (Array.isArray(rules.allowedLevels)) return arrayAllowedLevels(rules as any)
  }

  return missingAllowedLevels(rules)
}

function logRules(rule: boolean, rules: LoggingRules) {
  if (!rule || !STANDART_LEVELS.includes(rules.level)) return rule
  if (rules.isModule && !rules.isDev) return loggingRules(rules)

  return true
}

function disabledCategory(_level: string) {
  return false
}

function arrayAllowedLevels(rules: LoggingRules & { allowedLevels: string[] }) {
  return rules.allowedLevels.includes(rules.level)
}

function stringAllowedLevel(rules: LoggingRules & { allowedLevels: string }) {
  if (rules.allowedLevels.toLowerCase() === OFF) return false
  if (rules.showDebug || rules.level.toLowerCase() === rules.allowedLevels.toLowerCase()) return true
  if (!(rules.allowedLevels.toLowerCase() in LEVELS)) return stringAllowedLevel({ ...rules, allowedLevels: 'error' })
  if (!(rules.level.toLowerCase() in LEVELS)) return true

  return LEVELS[rules.level.toLowerCase()] >= LEVELS[rules.allowedLevels.toLowerCase()]
}

function missingAllowedLevels(rules: LoggingRules) {
  const showDebug = rules.showDebug == null ? !!rules.isDev : rules.showDebug
  if (showDebug) return true
  const debugLevels = rules.isModule ? rules.moduleDebugLevels : rules.debugLevels
  return !debugLevels.includes(rules.level)
}
