import { Module } from 'module'
import { dirname } from 'path'
import { searchPackage } from '../helpers/file'

const lpkg = searchPackage(__dirname)
export const LOGGER_VERSION = lpkg?.package?.version || '0.0.0'
export const LOGGER_PATHNAME = dirname(lpkg?.pathname || __filename)

const reqModule = Module.createRequire(process.cwd())
const mainPathname = reqModule?.main?.path
const mpkg = searchPackage(mainPathname || process.cwd())

export const ROOT = dirname(mpkg?.pathname || lpkg?.pathname || process.env.HOME || process.cwd())
export const ROOT_NAME = mpkg?.package?.name || lpkg?.package?.name || '??'
export const ROOT_VERSION = mpkg?.package?.version || '0.0.0'
