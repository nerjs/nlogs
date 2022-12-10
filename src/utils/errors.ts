import { BulkResponseItem } from '@elastic/elasticsearch/lib/api/types'
import { config } from '../config'
import { parseStackString } from '../helpers/stack'
import { Base } from './Base'
import { Parser } from './Parser'
import traceStore from './traceStore'
import { ElMessage, ElMsg } from './types'

export interface NlogsError {
  readonly details: {
    _stack?: string[]
    _stacks?: string[][]
    _target?: {
      index?: string
      data?: any
    }

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

  setTarget(index: string, data: any, rewrite?: boolean) {
    if (this.privateDetails._target && !rewrite) return this
    this.privateDetails._target = {
      index,
      data,
    }
  }

  protected getDetails() {
    const details = Object.assign({}, this.privateDetails)
    const parsedStack = parseStackString(this.stack)
    if (!details._stack && !details._stacks) {
      details._stack = parsedStack
    } else if (details._stack) {
      if (!details._stacks) details._stacks = []
      details._stacks.push(details._stack, parsedStack)
      delete details._stack
    } else if (details._stacks) {
      details._stacks.push(parsedStack)
    }
    return details
  }

  protected setDetails(...obj: (object | null | undefined)[]) {
    Object.assign(this.privateDetails, ...obj)
  }

  toParser(): Parser {
    const { project, service } = config.main
    const parser = new Parser()

    parser.parse(
      [
        Base.project(project),
        Base.service(service),
        Base.category(this.category),
        Base.meta({
          error: this.name,
        }),
        Base.level('error'),
        Base.timestamp(this.timestamp),
        Base.traceId(traceStore.traceId),
        Base.index(config.main.index.system),
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
    super(`The ping ended in failure. Attempt ${pingTryCount}`)
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

export interface ElasticsearchHttpError extends ProxyError {}
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
