import { clearString, FALSE_VARIANTS, prettyArray, prettyList, prettyValue, stringToBoolean, toString, TRUE_VARIANTS } from '../string'

describe('tests for string helpers', () => {
  it('clear string by patterns', () => {
    const str = 'first string second'
    const result = clearString(str, 'first', /second/)
    expect(result).not.toMatch('first')
    expect(result).not.toMatch(/second/)
  })

  describe('transforming a string into a boolean value by templates', () => {
    it('default value if incorrect string', () => {
      expect(stringToBoolean('wrong string', true)).toEqual(true)
    })

    it('default value if empty string', () => {
      expect(stringToBoolean('', true)).toEqual(true)
    })

    it('templates', () => {
      const trueVariants = [...TRUE_VARIANTS, ...TRUE_VARIANTS.map(s => ` ${s} `), ...TRUE_VARIANTS.map(s => s.toUpperCase())]
      const falseVariants = [...FALSE_VARIANTS, ...FALSE_VARIANTS.map(s => ` ${s} `), ...FALSE_VARIANTS.map(s => s.toUpperCase())]

      for (const str of trueVariants) expect(stringToBoolean(str, false)).toBeTruthy()
      for (const str of falseVariants) expect(stringToBoolean(str, true)).toBeFalsy()
    })
  })

  describe('conversion of different types to a string', () => {
    it('Date()', () => {
      const date = new Date()
      expect(toString(date)).toEqual(date.toJSON())
    })

    it('Symbol', () => {
      const sym = Symbol('some key')
      expect(toString(sym)).toEqual(sym.toString())
    })

    it('object with toString() method', () => {
      const obj = {
        toString() {
          return 'string value'
        },
      }

      expect(toString(obj)).toEqual(obj.toString())
    })

    it('other types', () => {
      const arr = [null, undefined, true, false]

      for (const val of arr) expect(toString(val)).toEqual(`${val}`)
    })
  })

  describe('pretty values', () => {
    it('return simple string', () => {
      expect(prettyValue('some_string')).not.toMatch(/^"(.*)"$/)
    })

    it('Forced string wrapping in quotation marks', () => {
      expect(prettyValue('some_string', true)).toMatch(/^"(.*)"$/)
    })

    it('wrapping the string in quotes if more than one word', () => {
      expect(prettyValue('two worlds')).toMatch(/^"(.*)"$/)
    })

    it('return empty array', () => {
      expect(prettyArray([])).not.toMatch(/^\[(.*)\]$/)
    })

    it('Forced array wrapping in brackets', () => {
      expect(prettyArray([], true)).toMatch(/^\[(.*)\]$/)
    })

    it('wrapping the array in brackets if more than zero items', () => {
      expect(prettyArray(['item'])).toMatch(/^\[(.*)\]$/)
    })

    it('pretty list with once value', () => {
      expect(prettyList('once value')).toMatch(/^"(.*)"$/)
    })

    it('pretty list with array values', () => {
      expect(prettyList(['once value'])).toMatch(/^\[(.*)\]$/)
    })
  })
})
