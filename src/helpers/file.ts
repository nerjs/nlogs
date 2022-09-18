import { readFileSync, Stats, statSync } from 'fs'
import { join } from 'path'

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

export const searchFile = (from: string, filename: string): string | null => {
  if (!from || from === '/' || from === HOME) return null
  const ex = exists(from)
  if (!ex?.isDirectory() || !existsFile(join(from, filename))) return searchFile(join(from, '..'), filename)

  return join(from, filename)
}

interface Pkg {
  name: string
  version: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export const searchPackage = (pathname: string): null | { package: Pkg; pathname: string } => {
  const file = searchFile(pathname, 'package.json')
  if (!file) return null
  const str = readFileSync(file, 'utf-8')
  return {
    package: JSON.parse(str),
    pathname: file,
  }
}

const packagesCache = new Map<string, Pkg | null>()
export const getPackage = (pathname: string): Pkg => {
  if (packagesCache.has(pathname)) return packagesCache.get(pathname)
  const pkg = searchPackage(pathname)
  packagesCache.set(pathname, pkg?.package || null)
  return packagesCache.get(pathname)
}

export const getPackageName = (pathname: string): string => getPackage(pathname)?.name || '??'
