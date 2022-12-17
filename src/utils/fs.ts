import { Stats, statSync } from 'fs'
import { join } from 'path'
import { FsNlogsError } from '../errors/fs.nlogs.error'
import { createDebug } from './debug'

const debug = createDebug('fs')
export const HOME = process.env.HOME || '/'

export const exists = (pathname: string): null | Stats => {
  try {
    return statSync(pathname)
  } catch (err) {
    if (err?.code === 'ENOENT') return null
    throw err
  }
}

export const existsDir = (dirname: string): boolean => !!exists(dirname)?.isDirectory()

export const existsFile = (filename: string): boolean => !!exists(filename)?.isFile()

export const searchFileRecursive = (from: string, filename: string): string | null => {
  if (!from || from === '/' || from === HOME) return null
  if (/^\.{1,2}\//.test(from)) throw new FsNlogsError('Incorrect pathname', from)
  if (from.startsWith('~')) return searchFileRecursive(from.replace(/^~/, process.env.HOME), filename)
  const ex = exists(from)
  const parentPath = join(from, '..')
  const fullPath = join(from, filename)
  debug(`Find file "${filename}" by path "${from}". parentPath="${parentPath}"; fullPath=${fullPath}`)
  if (!ex?.isDirectory()) return searchFileRecursive(parentPath, filename)
  if (exists(fullPath)) return fullPath

  return searchFileRecursive(parentPath, filename)
}
