import { HIDDEN_DETAILS, IS_META_INFO, META_VALUE } from '../../helpers/symbols'
import { StaticLogger } from '../static.logger'
import { TimeRange } from '../../message/time.range'

describe('static logger util', () => {
  it('no console', () => {
    const obj = {
      field: 'qwerty',
    }
    expect(StaticLogger.noConsole(obj)).toEqual(
      expect.objectContaining({
        [IS_META_INFO]: HIDDEN_DETAILS,
        [META_VALUE]: obj,
      }),
    )
  })

  describe('time range', () => {
    it('time range without end time', () => {
      expect(StaticLogger.timeRange(123)).toEqual(
        expect.objectContaining({
          [IS_META_INFO]: HIDDEN_DETAILS,
          [META_VALUE]: expect.any(TimeRange),
        }),
      )
    })

    it('without end & with label', () => {
      const label = 'label'
      const obj = StaticLogger.timeRange(123, label)
      const range = obj[META_VALUE] as TimeRange

      expect(range.delta.label).toEqual(label)
    })

    it('with end & with label', () => {
      const label = 'label'
      const end = 321
      const obj = StaticLogger.timeRange(123, end, label)
      const range = obj[META_VALUE] as TimeRange

      expect(range.to.getTime()).toEqual(end)
      expect(range.delta.label).toEqual(label)
    })
  })
})
