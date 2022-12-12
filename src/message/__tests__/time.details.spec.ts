import { TimeDetails } from '../time.details'

describe('time details', () => {
  it('create without label', () => {
    const ms = 12
    const time = new TimeDetails(ms)

    expect(time.ms).toEqual(ms)
    expect(time.pretty).toBeDefined()
    expect(time.label).not.toBeDefined()
  })

  it('create with label', () => {
    const label = 'test label'
    const time = new TimeDetails(12, label)

    expect(time.label).toEqual(label)
  })
})
