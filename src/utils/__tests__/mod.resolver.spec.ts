import { ModResolver } from '../mod.resolver'
import { join } from 'path'

const HOME = process.env.HOME
const pathname = join(__dirname, '../../..')
const tsPathname = join(__dirname, '../../../node_modules/typescript')
const fakePathname = join(__dirname, '../../../node_modules/test-fake-module')
const pkg = JSON.parse(pathname)
const tsPkg = JSON.parse(tsPathname)

describe('Module resolver', () => {
  let modResolver: ModResolver

  beforeEach(() => {
    modResolver = new ModResolver()
  })

  it('app module', () => {
    expect(modResolver.app.name).toEqual(pkg.name)
    expect(modResolver.app.version).toEqual(pkg.version)
    expect(modResolver.app.pathname).toEqual(pathname)
  })

  it('resolve module', () => {
    const mod = modResolver.resolve(tsPathname)
    expect(mod.name).toEqual(tsPkg.name)
    expect(mod.version).toEqual(tsPkg.version)
    expect(mod.pathname).toEqual(tsPathname)
  })

  it('Several of the same checks', () => {
    const mod = modResolver.resolve(tsPathname)
    const mod2 = modResolver.resolve(tsPathname)
    expect(mod).toEqual(mod2)
  })

  it('A module that does not exist returns an application module', () => {
    const mod = modResolver.resolve(fakePathname)
    expect(mod).toEqual(modResolver.app)
  })

  it('modules property', () => {
    modResolver.app
    expect(modResolver.modules.size).toEqual(1)
    expect(modResolver.modules.get(modResolver.app.pathname)).toEqual(modResolver.app)
  })

  it('The same module is saved with different paths', () => {
    const insideTsPathname = join(tsPathname, 'lib', 'test.js')
    const mod = modResolver.resolve(tsPathname)
    const mod2 = modResolver.resolve(insideTsPathname)
    expect(mod).toEqual(mod2)
    expect(modResolver.modules.has(tsPathname)).toBeTruthy()
    expect(modResolver.modules.has(insideTsPathname)).toBeTruthy()
    expect(modResolver.modules.get(tsPathname)).toEqual(modResolver.modules.get(insideTsPathname))
  })

  it('includes app file', () => {
    const insidePathname = join(pathname, 'lib', 'test.js')
    const mod = modResolver.resolve(insidePathname)
    expect(mod).toEqual(modResolver.app)
    expect(modResolver.modules.has(pathname)).toBeTruthy()
    expect(modResolver.modules.has(insidePathname)).toBeTruthy()
    expect(modResolver.modules.get(pathname)).toEqual(modResolver.modules.get(insidePathname))
  })

  it('Failed attempt to find an application module with nom variables', () => {
    const cwd = process.cwd
    process.cwd = jest.fn(() => join(HOME, 'fake', 'module'))
    process.env.npm_package_name = 'fake'
    expect(modResolver.app.name).toEqual(process.env.npm_package_name)

    process.cwd = cwd
  })

  it('Failed attempt to find an application module without nom variables', () => {
    const cwd = process.cwd
    process.cwd = jest.fn(() => join(HOME, 'fake', 'module'))
    delete process.env.npm_package_name
    delete process.env.npm_package_version
    expect(modResolver.app.name).toEqual(expect.any(String))

    process.cwd = cwd
  })

  it('Unsuccessful attempt to find a module', () => {
    modResolver.modules.set(fakePathname, null)
    const mod = modResolver.resolve(fakePathname)
    expect(mod).toEqual(modResolver.app)
  })

  it('Silent processing of an invalid path', () => {
    expect(modResolver.resolve('../d')).toEqual(modResolver.app)
  })

  it('Handling an invalid path with an error', () => {
    process.env.NLOGS_CONSISTENCY_CHECK = '1'
    expect(() => modResolver.resolve('../d')).toThrow()
  })
})
