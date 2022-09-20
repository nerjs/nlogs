import { Module } from 'module'
import { dirname, join } from 'path'
import { inDocker } from './docker'
import os from 'os'
import { existsDir, searchPackage } from './file'

const lpkg = searchPackage(__dirname)
export const LOGGER_VERSION = lpkg?.package?.version || '0.0.0'
export const LOGGER_PATHNAME = dirname(lpkg?.pathname || __filename)

const reqModule = Module.createRequire(process.cwd())
const mainPathname = reqModule?.main?.path
const mpkg = searchPackage(mainPathname)

export const ROOT = dirname(mpkg?.pathname || lpkg?.pathname || process.env.HOME || process.cwd())
export const ROOT_NAME = mpkg?.package?.name || lpkg?.package?.name || '??'
export const ROOT_VERSION = mpkg?.package?.version || '0.0.0'

export type LogDirType = 'project' | 'user' | 'home'
export const defaultLogDirectory = (type?: LogDirType): string => {
  if (!type) return defaultLogDirectory('home')
  if (type === 'user') return defaultLogDirectory('home')

  if (type === 'project') return join(ROOT, 'logs')

  if (inDocker() && existsDir('/var/log')) return 'var/log'

  return join(os.homedir(), '.config', ROOT_NAME, 'logs')
}
