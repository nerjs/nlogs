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

export interface LoggingMainRules {
  debugLevels: string[]
  moduleDebugLevels: string[]
  allowedLevels?: string | string[] | null
  isModule?: boolean | null
  isDev?: boolean | null
  showLogger?: boolean | null
}

export interface LoggingTempRules {
  showDebug?: boolean | null
  showCategory?: boolean | null
  showLog?: boolean | null
}

export function loggingRules(level: string, temp: LoggingTempRules, main: LoggingMainRules): boolean {
  const lvl = level.toLowerCase()
  if (temp.showLog != null) return logRules(temp.showLog, lvl, temp, main)
  if (main.showLogger != null) return logRules(main.showLogger, lvl, temp, { ...main, showLogger: null })
  if (lvl === FATAL || temp.showCategory === false) return true
  if (main.allowedLevels != null) {
    if (typeof main.allowedLevels === 'string') return stringAllowedLevel(lvl, main.allowedLevels.toLowerCase(), temp.showDebug)
    if (Array.isArray(main.allowedLevels)) return arrayAllowedLevels(lvl, main.allowedLevels)
  }

  return missingAllowedLevels(level, temp.showDebug, main)
}

function logRules(rule: boolean, level: string, temp: LoggingTempRules, main: LoggingMainRules) {
  if (!rule || !STANDART_LEVELS.includes(level)) return rule
  if (main.isModule && !main.isDev) return loggingRules(level, temp, main)

  return true
}

function arrayAllowedLevels(level: string, allowedLevels: string[]) {
  return allowedLevels.includes(level)
}

function stringAllowedLevel(level: string, allowedLevels: string, showDebug?: boolean | null) {
  if (allowedLevels === OFF) return false
  if (showDebug || level === allowedLevels) return true
  if (!(allowedLevels in LEVELS)) return stringAllowedLevel(level, 'error', showDebug)
  if (!(level in LEVELS)) return true

  return LEVELS[level] >= LEVELS[allowedLevels]
}

function missingAllowedLevels(level: string, showDebug: boolean | null | undefined, main: LoggingMainRules) {
  if (showDebug == null) return missingAllowedLevels(level, !!main.isDev, main)
  if (showDebug) return true
  const debugLevels = main.isModule ? main.moduleDebugLevels : main.debugLevels
  return !debugLevels.includes(level)
}
