import { clearString } from '../../helpers/string'
import { Category } from '../category'

describe('category', () => {
  const mod = { id: 'id', pathname: '' }
  const currentFilename = clearString(__filename, /^file:\/\//, /^\//)

  it('enabled category by default', () => {
    const category = new Category(mod)
    expect(category.enabled).toBeTruthy()
  })

  it('disable by default', () => {
    const category = new Category(mod)
    category.disable()
    expect(category.enabled).toBeFalsy()
  })
  it('enabled category by default', () => {
    const category = new Category(mod)
    category.disable()
    category.enable()
    expect(category.enabled).toBeTruthy()
  })

  it('string category name', () => {
    const categoryName = 'qwerty'
    const category = new Category(mod, categoryName)
    expect(category.name).toEqual(categoryName)
  })

  it('function category name', () => {
    function categoryFunction() {}
    const category = new Category(mod, categoryFunction)
    expect(category.name).toEqual(categoryFunction.name)
  })

  it('class category name', () => {
    class CategoryClass {}
    const category = new Category(mod, CategoryClass)
    expect(category.name).toEqual(CategoryClass.name)
  })

  it('instance category name', () => {
    class CategoryClass {}
    const category = new Category(mod, new CategoryClass())
    expect(category.name).toEqual(CategoryClass.name)
  })

  it('category from import.url', () => {
    const category = new Category(mod, { url: 'file:///home/test/dir/file.js' })
    expect(category.name).toEqual('home/test/dir/file.js')
  })

  it('category from module', () => {
    const category = new Category(mod, { filename: '/home/test/dir/file.js' })
    expect(category.name).toEqual('home/test/dir/file.js')
  })

  it('category from stack trace', () => {
    const category = new Category(mod)
    expect(category.name).toEqual(currentFilename)
  })

  it('relative path', () => {
    const category = new Category(
      {
        ...mod,
        pathname: '/home/folder1',
      },
      {
        filename: '/home/folder1/folder3/file',
      },
    )
    expect(category.name).toEqual('folder3/file')
  })

  it('throw if non object category name', () => {
    expect(() => new Category(mod, 123)).toThrow()
  })

  it('incorect object', () => {
    const category = new Category(mod, { someField: 'someValue' })
    expect(category.name).toEqual(mod.id)
  })

  it('empty filename', () => {
    const category = new Category(mod, { filename: '' })
    expect(category.name).toEqual(mod.id)
  })

  it('differed paths', () => {
    const pathname = '/home/folder1/folder2'
    const filename = '/home/folder1/folder3/file'
    const category = new Category(
      {
        ...mod,
        pathname,
      },
      { filename },
    )
    expect(category.name).toEqual(filename)
  })

  it('empty stacktrace', () => {
    const originalCST = Error.captureStackTrace
    Error.captureStackTrace = (obj: any) => {
      obj.stack = ''
    }

    const category = new Category(mod)
    expect(category.name).toEqual(mod.id)
    Error.captureStackTrace = originalCST
  })
})
