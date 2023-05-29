import { TimeRange } from '../time.range'

describe('time range', () => {
  it('only start time', () => {
    const ms = 123
    const range = new TimeRange(ms)

    expect(range.from).toEqual(expect.any(Date))
    expect(range.from.getTime()).toEqual(ms)
    expect(range.to).toEqual(expect.any(Date))
  })

  it('only start time with label', () => {
    const label = 'label'
    const range = new TimeRange(new Date(), label)

    expect(range.delta.label).toEqual(label)
  })

  it('with end time', () => {
    const ms = 321
    const range = new TimeRange(123, ms)

    expect(range.to).toEqual(expect.any(Date))
    expect(range.to.getTime()).toEqual(ms)
  })

  it('with end time and label', () => {
    const label = 'label'
    const range = new TimeRange(123, new Date(), label)

    expect(range.delta.label).toEqual(label)
  })

  it('Error if the start time is longer than the end time', () => {
    expect(() => new TimeRange(321, 123)).toThrow()
  })
})
