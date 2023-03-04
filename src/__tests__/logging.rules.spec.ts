import { FATAL, LEVELS, loggingRules, OFF, STANDART_LEVELS } from '../logging.rules'

describe('logging rules', () => {
  const levels = STANDART_LEVELS.concat('custom')

  describe('The show parameter for the log is set', () => {
    it('Show log', () => {
      const show = loggingRules('log', { showLog: true }, { debugLevels: [], moduleDebugLevels: [] })
      expect(show).toBeTruthy()
    })

    it('Do not show log', () => {
      const show = loggingRules('log', { showLog: false }, { debugLevels: [], moduleDebugLevels: [] })
      expect(show).toBeFalsy()
    })

    it('TRUE Ignored in production for the module (standard levels)', () => {
      const show = loggingRules('log', { showLog: false }, { debugLevels: [], moduleDebugLevels: [] })
      expect(show).toBeFalsy()
    })

    it('Works on production for the module (custom levels)', () => {
      const show = loggingRules('log', { showLog: true }, { debugLevels: [], moduleDebugLevels: [] })
      expect(show).toBeTruthy()
    })
  })

  describe('The show parameter for the logger is set', () => {
    it('Show log', () => {
      const show = loggingRules('log', {}, { debugLevels: [], moduleDebugLevels: [], showLogger: true })
      expect(show).toBeTruthy()
    })

    it('Do not show log', () => {
      const show = loggingRules('log', {}, { debugLevels: [], moduleDebugLevels: [], showLogger: false })
      expect(show).toBeFalsy()
    })

    it('TRUE Ignored in production for the module (standard levels)', () => {
      const show = loggingRules(
        'log',
        {
          showCategory: false,
        },
        {
          debugLevels: [],
          moduleDebugLevels: [],
          isDev: false,
          isModule: true,
          showLogger: true,
        },
      )

      expect(show).toBeFalsy()
    })

    it('Works on production for the module (custom levels)', () => {
      const show = loggingRules('log', {}, { debugLevels: [], moduleDebugLevels: [], showLogger: true })
      expect(show).toBeTruthy()
    })
  })

  describe('Category is disabled to show', () => {
    it('Do not show log', () => {
      levels.forEach(level => {
        const show = loggingRules(
          level,
          { showCategory: false },
          {
            debugLevels: [],
            moduleDebugLevels: [],
          },
        )
        expect(show).toBeFalsy()
      })
    })

    it('Show only fatal level', () => {
      const show = loggingRules(
        FATAL,
        { showCategory: false },
        {
          debugLevels: [],
          moduleDebugLevels: [],
        },
      )
      expect(show).toBeTruthy()
    })
  })

  describe('Array of acceptable logs', () => {
    const allowedLevels = ['info', 'custom', 'error']
    const notAllowedLevels = levels.filter(level => !allowedLevels.includes(level))

    it('All of the listed levels are allowed to display', () => {
      allowedLevels.forEach(level => {
        const show = loggingRules(
          level,
          {},
          {
            debugLevels: [],
            moduleDebugLevels: [],
            allowedLevels,
          },
        )

        expect(show).toBeTruthy()
      })
    })

    it('All levels not listed are forbidden to display', () => {
      notAllowedLevels.forEach(level => {
        const show = loggingRules(
          level,
          {},
          {
            debugLevels: [],
            moduleDebugLevels: [],
            allowedLevels,
          },
        )

        expect(show).toBeFalsy()
      })
    })

    it('the fatal level is allowed to be shown even if it is not on the list', () => {
      const show = loggingRules(
        FATAL,
        {},
        {
          debugLevels: [],
          moduleDebugLevels: [],
          allowedLevels,
        },
      )

      expect(show).toBeTruthy()
    })
  })

  describe('Maximum allowable log level', () => {
    describe('The maximum permissible level is an arbitrary value', () => {
      it('If the maximum level and the current level are equal and are arbitrary the log is allowed to be displayed', () => {
        const show = loggingRules(
          'custom',
          {},
          {
            allowedLevels: 'custom',
            debugLevels: [],
            moduleDebugLevels: [],
          },
        )

        expect(show).toBeTruthy()
      })

      it('Levels above or equal to ERROR are allowed', () => {
        const levelsAbove = STANDART_LEVELS.filter(level => level in LEVELS && LEVELS[level] >= LEVELS.error)

        levelsAbove.forEach(level => {
          const show = loggingRules(
            level,
            {},
            {
              debugLevels: [],
              moduleDebugLevels: [],
              allowedLevels: 'custom',
            },
          )

          expect(show).toBeTruthy()
        })
      })

      it('Levels below ERROR are not allowed', () => {
        const levelsBelow = STANDART_LEVELS.filter(level => level in LEVELS && LEVELS[level] < LEVELS.error)

        levelsBelow.forEach(level => {
          const show = loggingRules(
            level,
            {},
            {
              debugLevels: [],
              moduleDebugLevels: [],
              allowedLevels: 'custom',
            },
          )

          expect(show).toBeFalsy()
        })
      })
    })

    it('The log should not be displayed if the maximum level is set to "off" ("OFF").', () => {
      levels.forEach(level => {
        const show = loggingRules(
          level,
          { showDebug: false },
          {
            allowedLevels: OFF,
            debugLevels: [],
            moduleDebugLevels: [],
          },
        )

        expect(show).toBeFalsy()
      })
    })

    it('The log with the FATAL level is displayed even with the OFF limit', () => {
      const show = loggingRules(
        FATAL,
        { showDebug: false },
        {
          allowedLevels: OFF,
          debugLevels: [],
          moduleDebugLevels: [],
        },
      )

      expect(show).toBeTruthy()
    })

    it('Levels above the set as the maximum are allowed to be shown (includes custom)', () => {
      const levelsAbove = levels.filter(level => !(level in LEVELS) || LEVELS[level] >= LEVELS.info)

      levelsAbove.forEach(level => {
        const show = loggingRules(
          level,
          { showDebug: false },
          {
            debugLevels: [],
            moduleDebugLevels: [],
            allowedLevels: 'info',
          },
        )

        expect(show).toBeTruthy()
      })
    })

    it('Levels below the set as the maximum are not allowed to be shown', () => {
      const levelsBelow = levels.filter(level => level in LEVELS && LEVELS[level] < LEVELS.info)

      levelsBelow.forEach(level => {
        const show = loggingRules(
          level,
          { showDebug: false },
          {
            debugLevels: [],
            moduleDebugLevels: [],
            allowedLevels: 'info',
          },
        )

        expect(show).toBeFalsy()
      })
    })

    it('Levels below that set as the maximum are allowed to be shown when debugging is allowed', () => {
      const levelsBelow = levels.filter(level => level in LEVELS && LEVELS[level] < LEVELS.info)

      levelsBelow.forEach(level => {
        const show = loggingRules(
          level,
          { showDebug: true },
          {
            debugLevels: [],
            moduleDebugLevels: [],
            allowedLevels: 'info',
          },
        )

        expect(show).toBeTruthy()
      })
    })
  })

  describe('No set maximum logging level', () => {
    const debugLevels = ['trace', 'debug']
    const debugModuleLevels = ['trace', 'debug', 'log']

    it('Levels that are not on the debug list are allowed to display', () => {
      const noDebug = levels.filter(level => !debugLevels.includes(level))

      noDebug.forEach(level => {
        const show = loggingRules(
          level,
          { showDebug: false },
          {
            debugLevels,
            moduleDebugLevels: [],
            isModule: false,
          },
        )
        expect(show).toBeTruthy()
      })
    })

    it('Levels that are on the debug list are not allowed to be displayed', () => {
      debugLevels.forEach(level => {
        const show = loggingRules(
          level,
          { showDebug: false },
          {
            debugLevels,
            moduleDebugLevels: [],
            isModule: false,
          },
        )
        expect(show).toBeFalsy()
      })
    })

    it('Levels that are in the debug list are allowed to be displayed if debugging is allowed', () => {
      debugLevels.forEach(level => {
        const show = loggingRules(
          level,
          { showDebug: true },
          {
            debugLevels,
            moduleDebugLevels: [],
            isModule: false,
          },
        )
        expect(show).toBeTruthy()
      })
    })

    it('The fatal level is shown even if it is on the debug list and is not allowed to be shown', () => {
      const show = loggingRules(
        FATAL,
        { showDebug: false },
        {
          debugLevels: [FATAL],
          moduleDebugLevels: [],
          isModule: false,
        },
      )
      expect(show).toBeTruthy()
    })

    it('(MODULE) Levels that are not on the module debug list are allowed to display', () => {
      const noDebug = levels.filter(level => !debugModuleLevels.includes(level))

      noDebug.forEach(level => {
        const show = loggingRules(
          level,
          { showDebug: false },
          {
            debugLevels: [],
            moduleDebugLevels: debugModuleLevels,
            isModule: true,
          },
        )
        expect(show).toBeTruthy()
      })
    })

    it('(MODULE) Levels that are on the module debug list are not allowed to be displayed', () => {
      debugModuleLevels.forEach(level => {
        const show = loggingRules(
          level,
          { showDebug: false },
          {
            debugLevels: [],
            moduleDebugLevels: debugModuleLevels,
            isModule: true,
          },
        )
        expect(show).toBeFalsy()
      })
    })

    it('(MODULE) Levels that are in the module debug list are allowed to be displayed if debugging is allowed', () => {
      debugModuleLevels.forEach(level => {
        const show = loggingRules(
          level,
          { showDebug: true },
          {
            debugLevels: [],
            moduleDebugLevels: debugModuleLevels,
            isModule: true,
          },
        )
        expect(show).toBeTruthy()
      })
    })

    it('(MODULE) The fatal level is shown even if it is on the module debug list and is not allowed to be shown', () => {
      const show = loggingRules(
        FATAL,
        { showDebug: false },
        {
          debugLevels: [],
          moduleDebugLevels: [FATAL],
          isModule: true,
        },
      )
      expect(show).toBeTruthy()
    })

    it('If the debug resolution (showDebug) is not set, it isDev', () => {
      debugLevels.forEach(level => {
        const show = loggingRules(
          level,
          {},
          {
            debugLevels,
            moduleDebugLevels: [],
            isDev: true,
          },
        )
        expect(show).toBeTruthy()
      })

      debugLevels.forEach(level => {
        const show = loggingRules(
          level,
          {},
          {
            debugLevels,
            moduleDebugLevels: [],
            isDev: false,
          },
        )
        expect(show).toBeFalsy()
      })
    })
  })
})
