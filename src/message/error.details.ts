import { filterNotInternalStack, stackToArray } from '../utils/stack'

export interface ErrorDetails {
  name: string
  message: string
  stack: string[]
  [key: string]: any
}
export class ErrorDetails {
  hasDetails?: boolean
  readonly details?: Record<string, any>
  constructor(readonly error: Error) {
    const { name, message, stack, ...obj } = (error && typeof error === 'object' ? error : {}) as Error
    this.name = name
    this.message = message
    this.stack = filterNotInternalStack(stackToArray(stack))

    if (Object.keys(obj).length) {
      Object.assign(this, obj)
      this.details = obj
      this.hasDetails = true
    }
  }

  toJSON() {
    const { error, hasDetails, details, ...obj } = this
    return obj
  }

  toString() {
    return `${this.name}: ${this.message}`
  }
}
