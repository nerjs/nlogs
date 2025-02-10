import { MsgNlogsError } from '../errors/msg.nlogs.error'
import { TimeDetails } from './time.details'

export class TimeRange {
  readonly from: Date
  readonly to: Date
  readonly delta: TimeDetails

  constructor(from: number | Date, to?: number | Date)
  constructor(from: number | Date, label?: string)
  constructor(from: number | Date, to: number | Date, label?: string)
  constructor(from: number | Date, toOrLabel?: number | Date | string, label?: string) {
    this.from = from instanceof Date ? from : new Date(from)
    this.to = toOrLabel
      ? toOrLabel instanceof Date
        ? toOrLabel
        : typeof toOrLabel === 'number'
          ? new Date(toOrLabel)
          : new Date()
      : new Date()

    if (this.from > this.to) throw new MsgNlogsError('The start time cannot be greater than the end time', { from: this.from, to: this.to })
    const deltaLabel = toOrLabel && typeof toOrLabel === 'string' ? toOrLabel : label && typeof label === 'string' ? label : 'Time delta'
    this.delta = new TimeDetails(this.to.getTime() - this.from.getTime(), deltaLabel)
  }
}
