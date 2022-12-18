import { CategoriesAllowedList } from '../categories.allowed.list'

describe('categories allow list', () => {
  it('enable empty list', () => {
    // @ts-ignore
    const list = new CategoriesAllowedList()
    expect(list.allow('category', { name: '', type: 'app' })).toBeTruthy()
  })

  it('enable some global category', () => {
    const list = new CategoriesAllowedList('*:category')
    expect(list.allow('category', { name: '', type: 'app' })).toBeTruthy()
  })

  it('enable category or module', () => {
    const list = new CategoriesAllowedList('test')
    expect(list.allow('test', { name: 'someModule', type: 'app' })).toBeTruthy()
    expect(list.allow('someCategory', { name: 'test', type: 'app' })).toBeTruthy()

    expect(list.allow('test2', { name: 'someModule', type: 'app' })).toBeFalsy()
    expect(list.allow('test', { name: 'someModule', type: 'module' })).toBeFalsy()
  })

  it('missing module & category', () => {
    const list = new CategoriesAllowedList(':')
    expect(list.allow('category', { name: '', type: 'app' })).toBeTruthy()
  })

  it('disable main category', () => {
    const list = new CategoriesAllowedList('mainCat')
    expect(list.allow('mainCat2', { name: '', type: 'app' })).toBeFalsy()
  })

  it('enable all by *', () => {
    const list = new CategoriesAllowedList('*')
    expect(list.allow('category', { name: '', type: 'app' })).toBeTruthy()
    expect(list.allow('category', { name: 'module', type: 'module' })).toBeTruthy()
  })

  it('enable main by @', () => {
    const list = new CategoriesAllowedList('@:category')
    expect(list.allow('category', { name: '', type: 'app' })).toBeTruthy()
    expect(list.allow('category2', { name: '', type: 'app' })).toBeFalsy()
    expect(list.allow('category', { name: 'category', type: 'module' })).toBeFalsy()
  })

  it('enable main by @ and *', () => {
    const list = new CategoriesAllowedList('@:*')
    expect(list.allow('mainCat2', { name: '', type: 'app' })).toBeTruthy()
  })

  it('modules with category', () => {
    const list = new CategoriesAllowedList('module1,module2:category')
    expect(list.allow('category', { name: 'module1', type: 'app' })).toBeTruthy()
    expect(list.allow('category', { name: 'module1', type: 'module' })).toBeTruthy()
    expect(list.allow('category', { name: 'module2', type: 'module' })).toBeTruthy()
    expect(list.allow('category', { name: 'module3', type: 'module' })).toBeFalsy()
    expect(list.allow('category2', { name: 'module2', type: 'module' })).toBeFalsy()
  })
})
