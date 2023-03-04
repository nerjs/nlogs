import { LogInfo } from '../message/log.info'
import { Meta } from '../message/meta'
import { LogReader } from '../utils/log.reader'
import { StaticLogger } from '../utils/static.logger'
import { StringFormatter } from '../utils/string.formatter'
import { ILogger } from './types'
import { FALSE_VARIANTS, formatList, TRUE_VARIANTS, uuid } from './string'
import * as options from '../options'
import { ILoggerEnv } from '../utils/types'
import { BaseLogger } from '../base.logger'
import { PassThrough } from 'stream'
import { JsonFormatter } from '../utils/json.formatter'
import { ConsoleOut } from '../utils/console.out'
import { STDERR, STDOUT } from '../constants'

export const meta = new Meta('project', 'service', 'category', 'debug', 'traceId', new Date(), 'index')
export const stringFormatter = new StringFormatter()
export const stringReader = new LogReader(stringFormatter)

export const stringLogFn = jest.fn((str: string) => str)
export const infoLogFn = jest.fn((info: LogInfo) => stringLogFn(stringFormatter.format(info)))
export const testLogger: ILogger = {
  log: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('log'), ...msgs]))),
  debug: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('debug'), ...msgs]))),
  trace: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('trace'), ...msgs]))),
  info: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('info'), ...msgs]))),
  warn: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('warn'), ...msgs]))),
  error: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('error'), ...msgs]))),
}
export const clearMocks = () => {
  ;[stringLogFn, infoLogFn, ...Object.values(testLogger)].forEach((fn: jest.Mock) => {
    fn.mockClear()
  })
}

type Options = typeof options
type OptionsMainKeys = keyof Options
type OptionsKeys<O extends OptionsMainKeys> = keyof Options[O]
type OptionsVal<O extends OptionsMainKeys, K extends OptionsKeys<O>> = Options[O][K]
type LoadFn<O extends OptionsMainKeys, K extends OptionsKeys<O>> = () => Promise<OptionsVal<O, K>>
type IEnv = keyof ILoggerEnv

const createLoader =
  <O extends OptionsMainKeys, K extends OptionsKeys<O>>(optionsKey: O, key: K): LoadFn<O, K> =>
  async () => {
    const opt = await import('../options')
    return opt[optionsKey][key]
  }

const createIvRunner = <O extends OptionsMainKeys, T>(
  optionsKey: O,
  bodyCheckCallback: (load: LoadFn<O, OptionsKeys<O>>, variables: IEnv[], defaultValue: T | undefined, i: number) => void,
  archyCheckCallback?: (
    load: LoadFn<O, OptionsKeys<O>>,
    currentVariable: IEnv,
    variableList: IEnv[],
    defaultValue: T | undefined,
    i: number,
  ) => void,
) => {
  const iv = <K extends OptionsKeys<O>>(key: K, variables: IEnv | IEnv[], defaultValue?: T, defaultName?: string) => {
    if (!Array.isArray(variables)) return iv(key, [variables], defaultValue, defaultName)
    if (!variables.length) throw new Error(`The number of variables to check the key "${key?.toString()}" cannot be 0`)
    const load = createLoader(optionsKey, key)
    let i = 0

    if (defaultName || defaultValue !== undefined) {
      it(`from default value (${defaultValue})${
        defaultName ? ` (constant ${formatList(defaultName)})` : ''
      } with missing variable`, async () => {
        const value = await load()
        expect(value).toEqual(defaultValue)
      })
    }

    bodyCheckCallback(load, variables, defaultValue, ++i)

    if (variables.length === 1 || !archyCheckCallback) return

    for (let i = 1; i < variables.length; i++) {
      const currentList = variables.slice(i)
      const currentVariableName = variables[i - 1]
      describe('Checking the hierarchy of interchangeable variables', () => {
        archyCheckCallback(load, currentVariableName, currentList, defaultValue, ++i)
      })
    }
  }

  return iv
}

const createChecker = <O extends OptionsMainKeys, K extends OptionsKeys<O>, T, D extends T | undefined>(
  optionsKey: O,
  nextCorrectValue: (i: number, defaultValue?: D) => [env: string, val: T],
  nextIncorrectCorrectValue: (i: number, defaultValue?: D) => [env: string, val: T],
  equal: (val: any, exp: T) => void,
  notEqual: (val: any, exp: T) => void,
) =>
  createIvRunner(
    optionsKey,
    (load: LoadFn<O, K>, variables: IEnv[], defaultValue: D | undefined, pi: number) => {
      let i = pi * 1000

      for (const variableName of variables) {
        it(`from ${formatList(variableName)}`, async () => {
          const [env, val] = nextCorrectValue(i++, defaultValue)
          process.env[variableName] = env
          const value = await load()

          equal(value, val)
        })
      }

      it(`A non-valid value must be equal to the default value [${defaultValue}]`, async () => {
        const [env, val] = nextIncorrectCorrectValue(i++, defaultValue)
        process.env[variables[0]] = env

        const value = await load()
        equal(value, val)
      })
    },
    (load: LoadFn<O, K>, currentVariable: IEnv, variableList: IEnv[], defaultValue: D | undefined, pi: number) => {
      let i = pi * 1000

      it(`from ${formatList(currentVariable)} with exists ${formatList(variableList)}`, async () => {
        const [env, val] = nextCorrectValue(i++, defaultValue)

        const missingKeys = variableList.map((_, i) => nextCorrectValue(i++, defaultValue))
        process.env[currentVariable] = env
        variableList.forEach((vk, i) => {
          process.env[vk] = missingKeys[i][0]
        })

        const value = await load()

        equal(value, val)

        missingKeys.forEach(nval => {
          notEqual(value, nval[1])
        })
      })
    },
  )

export const createOptionsChecker = <O extends OptionsMainKeys>(optionsKey: O) => {
  const ivString = createChecker(
    optionsKey,
    i => [`test_value_${i}`, `test_value_${i}`],
    i => [` test_value_${i} `, `test_value_${i}`],
    (val, exp) => expect(val).toEqual(exp),
    (val, exp) => expect(val).not.toEqual(exp),
  )

  const ivSArrayOfString = createChecker(
    optionsKey,
    i => [`test_value_${i}_1,test_value_${i}_2`, [`test_value_${i}_1`, `test_value_${i}_2`]],
    i => [` test_value_${i}_1 , test_value_${i}_2 `, [`test_value_${i}_1`, `test_value_${i}_2`]],
    (val, exp) => {
      expect(val).toBeInstanceOf(Array)
      expect(val?.length).toEqual(exp.length)
      expect(val).toEqual(expect.arrayContaining(exp))
    },
    (val, exp) => {
      expect(val).not.toEqual(expect.arrayContaining(exp))
    },
  )

  const ivNumber = createChecker(
    optionsKey,
    i => [`${i}`, i],
    i => [` ${i} `, i],
    (val, exp) => expect(val).toEqual(exp),
    (val, exp) => expect(val).not.toEqual(exp),
  )

  const ivBoolean = createIvRunner(
    optionsKey,
    (load: LoadFn<O, OptionsKeys<O>>, variables: IEnv[], defaultValue?: boolean) => {
      const check = (typeVal: boolean, variableKey: IEnv, arr: string[]) => {
        for (const str of arr) {
          it(`check ${formatList(typeVal)} from ${formatList(variableKey)} and string value ${formatList(str)}`, async () => {
            process.env[variableKey] = str
            const value = await load()

            expect(value).toEqual(typeVal)
          })
        }
      }

      describe('Checking all variants', () => {
        for (const variableName of variables) {
          check(true, variableName, TRUE_VARIANTS)
          check(false, variableName, FALSE_VARIANTS)
        }
        check(true, variables[0], [' TruE ', ' T ', ' Y '])
      })

      it(`A non-valid value must be equal to the default value [${defaultValue}]`, async () => {
        process.env[variables[0]] = 'custom value'

        const value = await load()
        expect(value).toEqual(defaultValue)
      })
    },
    (load: LoadFn<O, OptionsKeys<O>>, currentVariable: IEnv, variableList: IEnv[]) => {
      it(`from ${formatList(currentVariable)} with exists ${formatList(variableList)}`, async () => {
        process.env[currentVariable] = TRUE_VARIANTS[0]
        variableList.forEach(vk => {
          process.env[vk] = FALSE_VARIANTS[0]
        })

        const value = await load()
        expect(value).toEqual(true)
      })
    },
  )

  const ivEnum = <K extends OptionsKeys<O>, T extends string>(
    key: K,
    variables: IEnv | IEnv[],
    variants: T[],
    defaultValue?: T,
    defaultName?: string,
  ) =>
    createIvRunner(
      optionsKey,
      (load: LoadFn<O, OptionsKeys<O>>, variables: IEnv[], defaultValue?: T) => {
        if (!variants.length) throw new Error('The number of options to check enum cannot be 0')

        describe('Checking all variants', () => {
          for (const variableName of variables) {
            for (const variant of variants) {
              it(`check variant ${formatList(variant)} from ${formatList(variableName)}`, async () => {
                process.env[variableName] = variant
                const value = await load()

                expect(value).toEqual(variant)
              })
            }
          }
        })

        it(`A non-valid value must be equal to the default value [${defaultValue}]`, async () => {
          process.env[variables[0]] = 'custom value'

          const value = await load()
          expect(value).toEqual(defaultValue)
        })
      },
      (load: LoadFn<O, OptionsKeys<O>>, currentVariable: IEnv, variableList: IEnv[], defaultValue?: T) => {
        if (!variants.length) throw new Error('The number of options to check enum cannot be 0')
        it(`from ${formatList(currentVariable)} with exists ${formatList(variableList)}`, async () => {
          process.env[currentVariable] = variants[0]
          variableList.forEach(vk => {
            process.env[vk] = variants[1] || defaultValue || uuid()
          })

          const value = await load()
          expect(value).toEqual(variants[0])
        })
      },
    )(key, variables, defaultValue, defaultName)

  const load = <K extends OptionsKeys<O>>(key: K) => createLoader(optionsKey, key)()

  return {
    ivString,
    ivSArrayOfString,
    ivNumber,
    ivBoolean,
    ivEnum,
    load,
  }
}

export const testStandartLevels = (TestLogger: typeof BaseLogger) => {
  describe('standart levels', () => {
    const outLevels = ['trace', 'debug', 'log', 'info']
    const errLevels = ['warn', 'error', 'fatal']
    let stdout: PassThrough
    let stderr: PassThrough
    let logger: BaseLogger<any>

    const oldOut = TestLogger.outLogs
    const oldFormatter = TestLogger.formatter

    afterAll(() => {
      TestLogger.outLogs = oldOut
      TestLogger.formatter = oldFormatter
    })

    beforeEach(() => {
      stdout = new PassThrough({ encoding: 'utf-8' })
      stderr = new PassThrough({ encoding: 'utf-8' })
      TestLogger.outLogs = new ConsoleOut(stdout, stderr)
      TestLogger.formatter = new JsonFormatter()
      logger = new TestLogger(null, { show: true })
    })
    ;[...outLevels, ...errLevels].forEach(level => {
      it(`level ${level}`, () => {
        const std = outLevels.includes(level) ? STDOUT : STDERR
        const stream = outLevels.includes(level) ? stdout : stderr
        logger[level]('message')
        const str = stream.read()
        expect(str).not.toBeNull()
        const message = JSON.parse(str)

        expect(message.meta.level).toEqual(level)
        expect(message.details._std).toEqual(std)
      })
    })
  })
}
