import { stackToArray } from '../utils/stack'
import { ErrorDetails } from './error.details'
import { TimeDetails } from './time.details'

interface IDetails {
  _error?: ErrorDetails
  _errors?: ErrorDetails | ErrorDetails[]
  _time?: TimeDetails
  _times?: TimeDetails | TimeDetails[]
  _stack?: string[] | { label: string; stack: string[] }
  _stacks?: (string[] | { label: string; stack: string[] })[]

  [key: string]: any
}

const setTo = (details: IDetails, onceField: string, arrayField: string, data: any, canSingle: boolean) => {
  if (!details[onceField] && !details[arrayField]) {
    if (canSingle) {
      details[onceField] = data
    } else {
      details[arrayField] = [data]
    }
  } else if (details[onceField] && !details[arrayField]) {
    details[arrayField] = [details[onceField], data]
    delete details[onceField]
  } else if (details[onceField] && details[arrayField]) {
    details[arrayField].push(details[onceField], data)
    delete details[onceField]
  } else if (Array.isArray(details[arrayField])) {
    details[arrayField].push(data)
  } else if (!Array.isArray(details[arrayField])) {
    setTo(details, `_${onceField}`, `_${arrayField}`, data, canSingle)
  }
}

export interface DetailsOptions {
  canSingleErrorInDetails: boolean
  canSingleTimeInDetails: boolean
  canSingleTraceInDetails: boolean
}

export interface Details extends IDetails {
  _depth?: number
}
export class Details {
  empty: boolean = true
  private noConsole: Record<string, any>

  constructor(private readonly options: DetailsOptions) {}

  assign(obj: object) {
    this.empty = false
    Object.assign(this, obj)
  }

  setNoConsole(obj: object) {
    if (!this.noConsole) this.noConsole = {}
    Object.assign(this.noConsole, obj)
  }

  setError(error: ErrorDetails) {
    if (!(error instanceof ErrorDetails)) return
    setTo(this, '_error', '_errors', error, this.options.canSingleErrorInDetails)
    if (error.hasDetails) {
      this.assign(error.details)
      this.empty = false
    }
  }

  setTime(time: TimeDetails) {
    if (!(time instanceof TimeDetails)) return
    setTo(this, '_time', '_times', time, this.options.canSingleTimeInDetails)
  }

  setStack(stack: string | string[], label?: string) {
    if (!Array.isArray(stack)) return this.setStack(stackToArray(stack), label)
    const fst = label ? { stack, label } : stack
    setTo(this, '_stack', '_stacks', fst, this.options.canSingleTraceInDetails)
  }

  setDepth(depth: number) {
    this._depth = depth
  }

  toClearedJSON() {
    const { empty, noConsole, options, _depth, _error, _errors, _time, _times, _stack, _stacks, ...obj } = this
    return obj
  }

  toJSON() {
    const { empty, noConsole, options, ...obj } = this
    return Object.assign({}, noConsole, obj)
  }
}
