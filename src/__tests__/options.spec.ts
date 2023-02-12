/* eslint-disable prefer-rest-params */
import { loggerOptions } from '../options'
import { FALSE_VARIANTS, formatList, TRUE_VARIANTS } from '../helpers/string'
import {
  DEFAULT_CATEGORY,
  DEFAULT_DEBUG_LEVELS,
  DEFAULT_FORMATTER,
  DEFAULT_MODULE_DEBUG_LEVELS,
  DEFAULT_PROJECT,
  DEFAULT_SERVICE,
  DEFAULT_STRICT_LEVEL_RULES,
  PRODUCTION_FORMATTER,
} from '../constants'

describe('generating parameters from environment variables', () => {
  beforeEach(() => {
    process.env = {}
    jest.resetModules()
  })

  describe('debugLevels field', () => {
    interchangeableVariablesArrays('debugLevels', ['NLOGS_DEBUG_LEVELS', 'DEBUG_LEVELS'], 'DEFAULT_DEBUG_LEVELS', DEFAULT_DEBUG_LEVELS)
  })

  describe('moduleDebugLevels field', () => {
    interchangeableVariablesArrays(
      'moduleDebugLevels',
      ['NLOGS_MODULE_DEBUG_LEVELS', 'MODULE_DEBUG_LEVELS'],
      'DEFAULT_MODULE_DEBUG_LEVELS',
      DEFAULT_MODULE_DEBUG_LEVELS,
    )
  })

  describe('allowedLevels field', () => {
    interchangeableVariables('allowedLevels', ['NLOGS_LEVEL', 'LOGGER_LEVEL', 'LEVEL'], undefined)
    interchangeableVariablesArrays('allowedLevels', ['NLOGS_LEVELS', 'LOGGER_LEVELS', 'LEVELS'], undefined)
  })

  describe('isDev field', () => {
    it('development mode', async () => {
      process.env.NODE_ENV = 'development'
      const { loggerOptions } = await import('../options')

      expect(loggerOptions.isDev).toBeTruthy()
    })

    it('production mode', async () => {
      process.env.NODE_ENV = 'production'
      const { loggerOptions } = await import('../options')

      expect(loggerOptions.isDev).toBeFalsy()
    })

    it('custom mode', async () => {
      process.env.NODE_ENV = 'custom' as any
      const { loggerOptions } = await import('../options')

      expect(loggerOptions.isDev).toBeTruthy()
    })

    it('missing NODE_ENV', async () => {
      const { loggerOptions } = await import('../options')
      expect(loggerOptions.isDev).toBeTruthy()
    })
  })

  describe('strictLevelRules field', () => {
    checkBooleanVariable(
      'strictLevelRules',
      ['NLOGS_STRICT_LEVEL_RULES', 'LOGGER_STRICT_LEVEL_RULES'],
      'DEFAULT_STRICT_LEVEL_RULES',
      DEFAULT_STRICT_LEVEL_RULES,
    )
  })

  describe('index field', () => {
    it('from "LOGGER_DEFAULT_INDEX"', async () => {
      process.env.LOGGER_DEFAULT_INDEX = 'idx'
      const { loggerOptions } = await import('../options')
      expect(loggerOptions.index).toEqual('idx')
    })
  })

  describe('formatterType field', () => {
    ;['json', 'light', 'dark', 'string'].forEach(val => {
      it(`"${val}" value from "NLOGS_FORMATTER"`, async () => {
        process.env.NLOGS_FORMATTER = val as any
        const { loggerOptions } = await import('../options')

        expect(loggerOptions.formatterType).toEqual(val)
      })
    })

    it('Incorrect value', async () => {
      process.env.NLOGS_FORMATTER = 'custom' as any
      const { loggerOptions } = await import('../options')

      expect(loggerOptions.formatterType).toEqual(DEFAULT_FORMATTER)
    })

    it('empty "NLOGS_FORMATTER" in production mode', async () => {
      process.env.NODE_ENV = 'production'
      const { loggerOptions } = await import('../options')

      expect(loggerOptions.formatterType).toEqual(PRODUCTION_FORMATTER)
    })

    it('empty "NLOGS_FORMATTER" in development mode', async () => {
      process.env.NODE_ENV = 'development'
      const { loggerOptions } = await import('../options')

      expect(loggerOptions.formatterType).toEqual(DEFAULT_FORMATTER)
    })
  })

  describe('categoriesAllowedList field', () => {
    interchangeableVariables(
      'categoriesAllowedList',
      [
        'NLOGS_CATEGORY',
        'LOGGER_CATEGORY',
        'SHOW_CATEGORY',
        'ALLOWED_CATEGORY',
        'CATEGORY',
        'NLOGS_CATEGORIES',
        'LOGGER_CATEGORIES',
        'SHOW_CATEGORIES',
        'ALLOWED_CATEGORIES',
        'CATEGORIES',
      ],
      undefined,
    )
  })

  describe('debugAllowedList field', () => {
    interchangeableVariables('debugAllowedList', ['NLOGS_DEBUG', 'LOGGER_DEBUG', 'NODE_DEBUG', 'DEBUG'], undefined)
  })

  describe('defaultProject field', () => {
    interchangeableVariables('defaultProject', ['NLOGS_PROJECT', 'LOGGER_PROJECT', 'PROJECT'], 'DEFAULT_PROJECT', DEFAULT_PROJECT)
  })
  describe('defaultService field', () => {
    interchangeableVariables('defaultService', ['NLOGS_SERVICE', 'LOGGER_SERVICE', 'SERVICE'], 'DEFAULT_SERVICE', DEFAULT_SERVICE)
  })

  describe('defaultCategory field', () => {
    it(`from default value (${DEFAULT_CATEGORY}) (constant "DEFAULT_CATEGORY")`, async () => {
      const { loggerOptions } = await import('../options')

      expect(loggerOptions.defaultCategory).toEqual(DEFAULT_CATEGORY)
    })
  })
})

function interchangeableVariables(key: keyof typeof loggerOptions, variables: (keyof NodeJS.ProcessEnv)[], defaultValue?: any)
function interchangeableVariables(
  key: keyof typeof loggerOptions,
  variables: (keyof NodeJS.ProcessEnv)[],
  defaultKey: any,
  defaultValue?: any,
)
function interchangeableVariables(
  key: keyof typeof loggerOptions,
  variables: (keyof NodeJS.ProcessEnv)[],
  _defaultKey?: any,
  _defaultValue?: any,
) {
  if (!variables.length) return

  const load = async () => {
    const { loggerOptions } = await import('../options')
    return loggerOptions[key]
  }

  for (const variableName of variables) {
    it(`from ${formatList(variableName)}`, async () => {
      const val = 'value'
      process.env[variableName] = val
      const value = await load()

      expect(value).toEqual(val)
    })
  }

  it('check incorrect value', async () => {
    process.env[variables[0]] = ' value '

    const value = await load()
    expect(value).toEqual('value')
  })

  const def = getDefValues(arguments, 2)
  if (def) {
    it(`from default value (${def.val})${def.key ? ` (constant ${formatList(def.key)})` : ''}`, async () => {
      const value = await load()
      expect(value).toEqual(def.val)
    })
  }

  if (variables.length === 1) return

  for (let i = 1; i < variables.length; i++) {
    const currentList = variables.slice(i)
    const currentVariableName = variables[i - 1]

    it(`from ${formatList(currentVariableName)} with exists ${formatList(currentList)}`, async () => {
      const val = 'value'
      const missingKeys = currentList.map((_, i) => `value_${i}`)
      process.env[currentVariableName] = val
      currentList.forEach((vk, i) => {
        process.env[vk] = missingKeys[i]
      })

      const value = await load()

      expect(value).toEqual(val)

      missingKeys.forEach(nval => {
        expect(value).not.toEqual(expect.arrayContaining([nval]))
      })
    })
  }
}

function interchangeableVariablesArrays(key: keyof typeof loggerOptions, variables: (keyof NodeJS.ProcessEnv)[], defaultValue?: any)
function interchangeableVariablesArrays(
  key: keyof typeof loggerOptions,
  variables: (keyof NodeJS.ProcessEnv)[],
  defaultKey: any,
  defaultValue?: any,
)
function interchangeableVariablesArrays(
  key: keyof typeof loggerOptions,
  variables: (keyof NodeJS.ProcessEnv)[],
  _defaultKey?: any,
  _defaultValue?: any,
) {
  if (!variables.length) return

  const load = async () => {
    const { loggerOptions } = await import('../options')
    return loggerOptions[key]
  }

  for (const variableName of variables) {
    it(`from ${formatList(variableName)}`, async () => {
      const arr = ['first', 'second']
      process.env[variableName] = arr.join(',')
      const value = await load()

      expect(value).toEqual(arr)
    })
  }

  it('check incorrect value', async () => {
    process.env[variables[0]] = ' first ,,  , second '

    const value = await load()
    expect(value).toEqual(['first', 'second'])
  })

  const def = getDefValues(arguments, 2)
  if (def) {
    it(`from default value (${def.val})${def.key ? ` (constant ${formatList(def.key)})` : ''}`, async () => {
      const value = await load()
      expect(value).toEqual(def.val)
    })
  }

  if (variables.length === 1) return

  for (let i = 1; i < variables.length; i++) {
    const currentList = variables.slice(i)
    const currentVariableName = variables[i - 1]

    it(`from ${formatList(currentVariableName)} with exists ${formatList(currentList)}`, async () => {
      const arr = ['first', 'second']
      const missingKeys = currentList.map((_, i) => [`first_${i}`, `second_${i}`])
      process.env[currentVariableName] = arr.join(',')
      currentList.forEach((vk, i) => {
        process.env[vk] = missingKeys[i].join(',')
      })

      const value = await load()

      expect(value).toEqual(arr)

      missingKeys.flat().forEach(nval => {
        expect(value).not.toEqual(expect.arrayContaining([nval]))
      })
    })
  }
}

function checkBooleanVariable(key: keyof typeof loggerOptions, variables: (keyof NodeJS.ProcessEnv)[], defaultValue?: any)
function checkBooleanVariable(key: keyof typeof loggerOptions, variables: (keyof NodeJS.ProcessEnv)[], defaultKey: any, defaultValue?: any)
function checkBooleanVariable(
  key: keyof typeof loggerOptions,
  variables: (keyof NodeJS.ProcessEnv)[],
  _defaultKey?: any,
  _defaultValue?: any,
) {
  if (!variables.length) return

  const load = async () => {
    const { loggerOptions } = await import('../options')
    return loggerOptions[key]
  }

  const check = (typeVal: boolean, variableKey: keyof NodeJS.ProcessEnv, arr: string[]) => {
    it(`check ${typeVal} from ${variableKey}`, async () => {
      for (const str of arr) {
        jest.resetModules()
        process.env[variableKey] = str
        const value = await load()

        expect(value).toEqual(typeVal)
      }
    })
  }

  for (const variableName of variables) {
    check(true, variableName, TRUE_VARIANTS)
    check(false, variableName, FALSE_VARIANTS)
  }

  const def = getDefValues(arguments, 2)
  if (def) {
    it(`from default value (${def.val})${def.key ? ` (constant ${formatList(def.key)})` : ''} with missing variable`, async () => {
      const value = await load()
      expect(value).toEqual(def.val)
    })

    it(`from default value (${def.val})${def.key ? ` (constant ${formatList(def.key)})` : ''} with incorrect variable`, async () => {
      process.env[variables[0]] = 'custom text'
      const value = await load()
      expect(value).toEqual(def.val)
    })
  }

  if (variables.length === 1) return

  for (let i = 1; i < variables.length; i++) {
    const currentList = variables.slice(i)
    const currentVariableName = variables[i - 1]

    it(`from ${formatList(currentVariableName)} with exists ${formatList(currentList)}`, async () => {
      process.env[currentVariableName] = TRUE_VARIANTS[0]
      currentList.forEach(vk => {
        process.env[vk] = FALSE_VARIANTS[0]
      })

      const value = await load()
      expect(value).toEqual(true)
    })
  }
}

function getDefValues(args: IArguments, max: number): { key?: string; val: any } | null {
  if (args.length <= max) return null
  const key = args.length === max + 2 && args[max]
  const val = args[args.length - 1]

  return { key, val }
}
