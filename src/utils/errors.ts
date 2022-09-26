import { BulkResponseItem } from '@elastic/elasticsearch/lib/api/types'
import { CURRENT_PROJECT, CURRENT_SERVICE } from '../constants'
import { ROOT_NAME } from '../helpers/package'
import { parseStackString } from '../helpers/stack'
import { Base } from './Base'
import { Parser } from './Parser'
import { TraceStore } from './TraceStore'
import { ElMessage, ElMsg } from './types'

export interface NlogsError {
  readonly details: {
    stack?: string[]
    stacks?: string[][]

    [key: string]: any
  }
}
export class NlogsError extends Error {
  readonly timestamp = new Date()
  protected readonly privateDetails: any = {}

  constructor(message: string) {
    super(message)

    Object.defineProperty(this, 'details', {
      enumerable: true,
      get: () => this.getDetails(),
    })
  }

  get name() {
    return this.constructor.name
  }

  get category() {
    return this.name
  }

  private getDetails() {
    const details = Object.assign({}, this.privateDetails)
    const parsedStack = parseStackString(this.stack)
    if (!details.stack && !details.stacks) {
      details.stack = parsedStack
    } else if (details.stack) {
      if (!details.stacks) details.stacks = []
      details.stacks.push(details.stack, parsedStack)
      delete details.stack
    } else if (details.stacks) {
      details.stacks.push(parsedStack)
    }
    return details
  }

  protected setDetails(...obj: (object | null | undefined)[]) {
    Object.assign(this.privateDetails, ...obj)
  }

  toJSON(): ElMessage<this['details']> {
    return {
      message: `${this.name}: ${this.message}`,
      meta: {
        project: CURRENT_PROJECT,
        service: CURRENT_SERVICE || ROOT_NAME,
        category: this.category,
        level: 'error',
        timestamp: this.timestamp,
        traceId: TraceStore.traceId,
        error: this.name,
      },
      details: this.details,
      ['@timestamp']: this.timestamp,
    }
  }

  toParser(): Parser {
    const parser = new Parser()

    parser.parse(
      [
        Base.project(CURRENT_PROJECT),
        Base.service(CURRENT_SERVICE || ROOT_NAME),
        Base.category(this.category),
        Base.meta({
          error: this.name,
        }),
        Base.level('error'),
        Base.timestamp(this.timestamp),
        Base.traceId(TraceStore.traceId),
        this.message,
        this.details || {},
      ].filter(Boolean),
    )

    return parser
  }
}

export interface ProxyError extends NlogsError {
  details: NlogsError['details'] & {
    _targetMessage?: string
    _error: {
      name: string
      message: string
      stack: string[]
      [key: string]: any
    }
  }
}
export class ProxyError extends NlogsError {
  constructor(readonly originalError: Error, message?: string) {
    super(message || originalError.message)

    this.setDetails(
      {
        _error: {
          ...originalError,
          name: originalError.name,
          message: originalError.message,
          stack: parseStackString(originalError.stack),
        },
      },
      message && {
        _targetMessage: message,
      },
    )
  }

  static from(err: Error, message?: string) {
    if (err instanceof NlogsError) return err
    return new this(err, message)
  }
}

export interface PingError extends NlogsError {
  details: NlogsError['details'] & {
    _pingTryCount: number
  }
}
export class PingError extends NlogsError {
  constructor(pingTryCount: number = 1) {
    super(`Пинг завершился неудачей. Попытка ${pingTryCount}`)
    this.setDetails({ _pingTryCount: pingTryCount })
  }
}

export interface NotInitializedError extends NlogsError {
  details: NlogsError['details'] & {
    _transport: {
      name: string
      method: string
    }
  }
}
export class NotInitializedError extends NlogsError {
  constructor(transportName: 'file' | 'elasticsearch', callMethod: string) {
    super(`Вызов метода ${callMethod} до инициалиации (или при отсутствии конфига) транспорта ${transportName}`)
    this.setDetails({
      _transport: {
        name: transportName,
        method: callMethod,
      },
    })
  }
}

export interface ElasticsearchHttpError extends ProxyError {
  details: ProxyError['details'] & {
    _target?: {
      index?: string
      data?: any
    }
  }
}
export class ElasticsearchHttpError extends ProxyError {
  constructor(originalError: Error, index?: string, data?: any) {
    super(originalError)
    this.setDetails(
      (index || data) && {
        _target: Object.assign({}, index && { index }, data && { data }),
      },
    )
  }

  get category(): string {
    return this.privateDetails?._target?.data?.meta?.category || this.name
  }

  static from(err: Error, index?: string, data?: any) {
    if (err instanceof NlogsError) return err
    return new ElasticsearchHttpError(err, index, data)
  }
}

export type BulkErrorResponse = Pick<BulkResponseItem, '_id' | '_index' | 'result' | 'status'> & Required<Pick<BulkResponseItem, 'error'>>

export interface ElasticsearchBulkError extends NlogsError {
  details: NlogsError['details'] & {
    _target?: {
      index?: string
      data?: any
    }
    _error: BulkErrorResponse
  }
}
export class ElasticsearchBulkError extends NlogsError {
  constructor(readonly bulkError: BulkErrorResponse, index?: string, data?: any) {
    super(bulkError.error.reason)
    const { _id, _index, status, result, error } = bulkError
    this.setDetails(
      {
        _error: {
          _id,
          _index,
          status,
          result,
          error,
        },
      },
      (index || data) && {
        _target: Object.assign({}, index && { index }, data && { data }),
      },
    )
  }
}

export interface ElasticsearchFailMessageError extends NlogsError {
  details: NlogsError['details'] & {
    _reason?: string
    _message: ElMsg
  }
}
export class ElasticsearchFailMessageError extends NlogsError {
  constructor(msg: ElMsg, reason?: string) {
    super(`[Unable to send a message] ${reason || msg.message}`)

    this.setDetails(
      {
        _message: msg,
      },
      reason && { _reason: reason },
    )
  }
}
