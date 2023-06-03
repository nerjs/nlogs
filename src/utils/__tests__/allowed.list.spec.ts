import { ALL, AllowedList, APP, DELIMITER, MODULE, NEGATION, SPECIAL_DELIMITER } from '../allowed.list'

describe('Parsing a string to get a allowed list', () => {
  describe('Allow application categories', () => {
    it('Allow all categories in the absence of instructions', () => {
      const alist = new AllowedList()

      expect(alist.allow('some category')).toBeTruthy()
      expect(alist.allow('other category')).toBeTruthy()
    })

    it('Allow categories by name', () => {
      const alist = new AllowedList(`category1${DELIMITER}category2`)
      expect(alist.allow('category1')).toBeTruthy()
      expect(alist.allow('category2')).toBeTruthy()
    })

    it('Deny a category if it is not in the list', () => {
      const alist = new AllowedList('category1')
      expect(alist.allow('category2')).toBeFalsy()
    })

    it('Deny a category by a negation character', () => {
      const alist = new AllowedList(`${NEGATION}category`)
      expect(alist.allow('category')).toBeFalsy()
    })

    it('Allow a category with a special symbol', () => {
      const alist = new AllowedList(`${APP}${SPECIAL_DELIMITER}category`)
      expect(alist.allow('category')).toBeTruthy()
    })

    it('Allow all categories by special symbol and pattern', () => {
      const alist = new AllowedList(`${APP}${SPECIAL_DELIMITER}${ALL}`)
      expect(alist.allow('category1')).toBeTruthy()
      expect(alist.allow('category2')).toBeTruthy()
    })

    it('Use of any delimiter', () => {
      const delimiter = '~'
      const alist = new AllowedList(`category1${delimiter}!category2`, delimiter)

      expect(alist.allow('category1')).toBeTruthy()
      expect(alist.allow('category2')).toBeFalsy()
    })

    it('Deny all categories by pattern', () => {
      const alist = new AllowedList(`${NEGATION}${ALL}`)

      expect(alist.allow('category1')).toBeFalsy()
      expect(alist.allow('category2')).toBeFalsy()
    })

    it('Deny all categories by special symbol and pattern', () => {
      const alist = new AllowedList(`${NEGATION}${APP}${SPECIAL_DELIMITER}${ALL}`)

      expect(alist.allow('category1')).toBeFalsy()
      expect(alist.allow('category2')).toBeFalsy()
    })

    it('Deny all categories and allow one category', () => {
      const alist = new AllowedList(`${NEGATION}${APP}${SPECIAL_DELIMITER}${ALL}${DELIMITER}category2`)

      expect(alist.allow('category1')).toBeFalsy()
      expect(alist.allow('category2')).toBeTruthy()
    })
  })

  describe('Allow module categories', () => {
    it('Allow all modules in the absence of instructions', () => {
      const alist = new AllowedList()

      expect(alist.allow('some category', 'some module')).toBeTruthy()
      expect(alist.allow('other category', 'other module')).toBeTruthy()
    })

    it('Allow all module categories by module name', () => {
      const alist = new AllowedList(`moduleName`)

      expect(alist.allow('category1', 'moduleName')).toBeTruthy()
      expect(alist.allow('category2', 'moduleName')).toBeTruthy()
    })

    it('Deny all module categories if it is not in the list', () => {
      const alist = new AllowedList(`someModuleName`)

      expect(alist.allow('category1', 'moduleName')).toBeFalsy()
    })

    it('Allow all module categories by pattern', () => {
      const alist = new AllowedList(`moduleName${SPECIAL_DELIMITER}${ALL}`)

      expect(alist.allow('category1', 'moduleName')).toBeTruthy()
      expect(alist.allow('category2', 'moduleName')).toBeTruthy()
    })

    it('Allow categories in modules by special symbol', () => {
      const alist = new AllowedList(`${MODULE}${SPECIAL_DELIMITER}category`)

      expect(alist.allow('category', 'moduleName1')).toBeTruthy()
      expect(alist.allow('category', 'moduleName2')).toBeTruthy()
    })

    it('Deny module category by special symbol, name and negation character', () => {
      const alist = new AllowedList(`${NEGATION}${MODULE}${SPECIAL_DELIMITER}category`)

      expect(alist.allow('category', 'moduleName1')).toBeFalsy()
      expect(alist.allow('category', 'moduleName2')).toBeFalsy()
    })

    it('Allow all modules by special symbol and pattern', () => {
      const alist = new AllowedList(`${MODULE}${SPECIAL_DELIMITER}${ALL}`)

      expect(alist.allow('category1', 'moduleName1')).toBeTruthy()
      expect(alist.allow('category2', 'moduleName2')).toBeTruthy()
    })

    it('Deny module by name and negation character', () => {
      const alist = new AllowedList(`${NEGATION}moduleName`)

      expect(alist.allow('category', 'moduleName')).toBeFalsy()
    })

    it('Disallow all modules', () => {
      const alist = new AllowedList(`${NEGATION}${MODULE}${SPECIAL_DELIMITER}${ALL}`)

      expect(alist.allow('category1', 'moduleName1')).toBeFalsy()
      expect(alist.allow('category2', 'moduleName2')).toBeFalsy()
    })

    it('Deny all modules and allow one module category', () => {
      const alist = new AllowedList(`${NEGATION}${MODULE}${SPECIAL_DELIMITER}${ALL}${DELIMITER}moduleName2${SPECIAL_DELIMITER}category2`)

      expect(alist.allow('category1', 'moduleName1')).toBeFalsy()
      expect(alist.allow('category2', 'moduleName2')).toBeTruthy()
    })
  })

  describe('other use cases', () => {
    it('Allow all', () => {
      const alist = new AllowedList('*')

      expect(alist.allow('category1')).toBeTruthy()
      expect(alist.allow('category2', 'moduleName')).toBeTruthy()
    })

    it('Allow all with special delimiter', () => {
      const alist = new AllowedList(':*')

      expect(alist.allow('category1')).toBeTruthy()
      expect(alist.allow('category2', 'moduleName')).toBeTruthy()
    })

    it('Deny all', () => {
      const alist = new AllowedList('!*')

      expect(alist.allow('category1')).toBeFalsy()
      expect(alist.allow('category2', 'moduleName')).toBeFalsy()
    })

    it('Deny all with special delimiter', () => {
      const alist = new AllowedList('!:*')

      expect(alist.allow('category1')).toBeFalsy()
      expect(alist.allow('category2', 'moduleName')).toBeFalsy()
    })

    it('Deny all with only negation symbol', () => {
      const alist = new AllowedList('!')

      expect(alist.allow('category1')).toBeFalsy()
      expect(alist.allow('category2', 'moduleName')).toBeFalsy()
    })
  })
})
