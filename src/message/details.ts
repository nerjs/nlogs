import { MsgNlogsError } from '../errors/msg.nlogs.error'
import { ErrorDetails } from './error.details'
import { ModDetails } from './mod.details'
import { TimeDetails } from './time.details'
import { TimeRange } from './time.range'

interface IDetails {
  _errors?: ErrorDetails[]
  _times?: TimeDetails[]
  _stacktraces?: { label?: string; stack: string[] }[]
  _timeRange?: TimeRange
  _depth?: number
  _module?: ModDetails

  [key: string]: any
}

export class Details {
  readonly details: Record<string, any> = {}
  readonly hidden: Record<string, any> = Object.create(null)
  readonly reserved: IDetails = Object.create(null)

  get empty() {
    return !Object.keys(this.details).length
  }

  get stacks() {
    return this.reserved._stacktraces || []
  }

  get errors() {
    return this.reserved._errors || []
  }

  get times() {
    return this.reserved._times || []
  }

  get timeRange() {
    return this.reserved._timeRange
  }

  get depth() {
    return this.reserved._depth
  }

  get module() {
    return this.reserved._module
  }

  assign(obj: object) {
    for (const key in obj) this.details[key] = obj[key]
  }

  hiddenAssign<D extends IDetails>(obj: D) {
    for (const key in obj) this.hidden[key] = obj[key]
  }

  setError(error: ErrorDetails) {
    if (!(error instanceof ErrorDetails)) return
    if (!this.reserved._errors) this.reserved._errors = []
    this.reserved._errors.push(error)
    if (error.hasDetails) {
      this.assign(error.details)
    }
  }

  setTime(time: TimeDetails) {
    if (!(time instanceof TimeDetails)) return
    if (!this.reserved._times) this.reserved._times = []
    this.reserved._times.push(time)
  }

  setStacktrace(stack: string[], label?: string) {
    if (!this.reserved._stacktraces) this.reserved._stacktraces = []
    this.reserved._stacktraces.push({ stack, label })
  }

  setDepth(depth: number) {
    this.reserved._depth = depth
  }

  setTimeRange(range: TimeRange) {
    if (this.reserved._timeRange) throw new MsgNlogsError('It is not correct to add a time range twice to the same log.', range)
    this.reserved._timeRange = range
    this.setTime(range.delta)
  }

  setModule(mod: ModDetails): void
  setModule(name: string, version?: string): void
  setModule(nameOrMod: string | ModDetails, version?: string): void {
    if (typeof nameOrMod === 'string') return this.setModule(new ModDetails(nameOrMod, version))
    this.reserved._module = nameOrMod
  }

  toJSON() {
    // return Object.assign({}, this.hidden, this.details, this.reserved)
    // return {
    //   ...this.hidden,
    //   ...this.details,
    //   ...this.reserved,
    // }

    const result: Record<string, any> = {}
    for (const key in this.hidden) result[key] = this.hidden[key]
    for (const key in this.details) result[key] = this.hidden[key]
    for (const key in this.reserved) result[key] = this.hidden[key]
    return result
  }
}
