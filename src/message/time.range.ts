import { MsgNlogsError } from '../errors/msg.nlogs.error'
import { TimeDetails } from './time.details'

export class TimeRange {
  readonly from: Date
  readonly to: Date
  readonly delta: TimeDetails

  constructor(from: number | Date, to?: number | Date) {
    this.from = from instanceof Date ? from : new Date(from)
    this.to = to ? (to instanceof Date ? to : new Date(from)) : new Date()

    if (this.from > this.to) throw new MsgNlogsError('The start time cannot be greater than the end time', { from, to })
    this.delta = new TimeDetails(this.to.getTime() - this.from.getTime(), 'Time delta')
  }
}
