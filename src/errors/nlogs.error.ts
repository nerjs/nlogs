export abstract class NlogsError<C = unknown> extends Error {
  abstract readonly code: string
  constructor(message: string, cause?: C) {
    super(message, cause !== undefined ? { cause } : undefined)
  }

  get cause(): C {
    return super.cause as C
  }

  get name() {
    return this.constructor.name
  }

  toString() {
    return `${this.name}: ${this.message}`
  }

  toJSON() {
    const { name, message, cause, code, stack, ...obj } = this
    return {
      name,
      code,
      message,
      cause,
      stack,
      ...obj,
    }
  }
}
