import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { FsNlogsError } from '../../errors/fs.nlogs.error'
import { exists, existsDir, existsFile, searchFileRecursive } from '../fs'

describe('tests for fs helpers', () => {
  describe('exists', () => {
    it('exists pathname', () => {
      expect(exists(__dirname)).toBeTruthy()
    })

    it('not exists pathname', () => {
      const incorrectPathname = join(__dirname, 'some/path')
      expect(exists(incorrectPathname)).toBeFalsy()
    })

    it('error when incorrect pathname', () => {
      // @ts-ignore
      expect(() => exists(123)).toThrow()
    })

    it('check exists directory', () => {
      expect(existsDir(__dirname)).toBeTruthy()
      expect(existsDir(__filename)).toBeFalsy()
    })

    it('check exists file', () => {
      expect(existsFile(__filename)).toBeTruthy()
      expect(existsFile(__dirname)).toBeFalsy()
    })
  })

  describe('search file recursive', () => {
    it('incorrect from argument', () => {
      expect(searchFileRecursive('', '')).toBeNull()
      expect(searchFileRecursive('/', '')).toBeNull()
      expect(searchFileRecursive(process.env.HOME, '')).toBeNull()
    })

    it('missing HOME environment', async () => {
      jest.resetModules()
      const { HOME: prevHome } = process.env
      delete process.env.HOME
      const { HOME } = await import('../fs')

      expect(HOME).toBeDefined()

      process.env.HOME = prevHome
    })

    it('Relative paths are not supported', () => {
      expect(() => searchFileRecursive('./test/path', '')).toThrow(FsNlogsError)
      expect(() => searchFileRecursive('../test/path', '')).toThrow(FsNlogsError)
    })

    it('search in the user directory', async () => {
      const files = await readdir(process.env.HOME)
      const file = await (async () => {
        for (const f of files) {
          try {
            if ((await stat(join(process.env.HOME, f))).isDirectory()) return f
          } catch (err) {
            if (err.code === 'ENOENT') continue
            throw err
          }
        }
      })()

      if (file) {
        expect(searchFileRecursive('~/', file)).toEqual(join(process.env.HOME, file))
      } else {
        console.log(`Missing any file in user directore`)
      }
    })
  })
})
