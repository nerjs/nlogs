import { readFileSync } from 'fs'
import { createDebug } from './debug'
import { searchFileRecursive } from './fs'

const debug = createDebug('pkg')

interface Pkg {
  name: string
  version: string
  root: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

export const pkgFinder = (pathname: string): Pkg | null => {
  const root = searchFileRecursive(pathname, 'package.json')
  if (!root) return null
  try {
    return JSON.parse(readFileSync(root, 'utf-8'))
  } catch (err) {
    debug(err)
    return null
  }
}
