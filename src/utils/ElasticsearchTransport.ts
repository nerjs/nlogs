import { Transport } from './Transport'
import { ElasticseaarchConfig } from '../config/types'
import { Parser } from './Parser'
import { ElMessage } from './types'
import { ElasticsearchTransportClient } from './ElasticsearchTransportClient'
import { Base } from './Base'
import { STACKTRACE, TIME } from './symbols'
import { NlogsError, PingError, ProxyError } from './errors'
import { sleep, waitTick } from '../helpers/time'
import BatchLoader from '@nerjs/batchloader'

export class ElasticsearchTransport extends Transport<ElasticseaarchConfig> {
  readonly MAX_PING_COUNT = 100
  readonly MAX_LOOP_PING = 10
  readonly CHECK_ALLOWED_TIMEOUT = 1000 * 60
  private client: ElasticsearchTransportClient

  init() {
    if (!this.allowed) return
    this.client = new ElasticsearchTransportClient(this.config.config)
    this.client.on('error', err => this.emit('error', ProxyError.from(err)))
  }

  #count = 0
  count(): number {
    return this.#count
  }

  parseToJson(parser: Parser): ElMessage {
    const details: Record<string, any> = parser.details ? { ...parser.details } : {}
    const stacks = []
    const message = parser.messages
      .filter(msg => {
        if (!Base.isMessage(msg)) return true
        if (msg[STACKTRACE]) {
          stacks.push(msg[STACKTRACE])
          return false
        }

        if (msg[TIME] !== undefined)
          details._time = {
            time: msg[TIME],
            pretty: ElasticsearchTransport.toPrettyTime(msg[TIME]),
          }

        return true
      })
      .map(msg => ElasticsearchTransport.toValueMsg(msg))
      .join(' ')

    if (stacks.length) {
      if (stacks.length === 1 && !details.stack) {
        details._stack = stacks[0]
      } else if (!details.stacks) {
        details._stacks = stacks
      } else {
        details._stacktraces = stacks
      }
    }

    return {
      meta: { ...parser.meta },
      message,
      details,
      ['@timestamp']: parser.meta.timestamp,
    }
  }

  #lastResult = false
  #pingsCount = 0
  #checkAllowedTid: NodeJS.Timer
  private async checkAllowed() {
    clearTimeout(this.#checkAllowedTid)

    if (await this.client.ping()) {
      this.config.allowed = true
      this.#pingsCount = 0
      return
    }

    this.config.allowed = false

    this.#checkAllowedTid = setTimeout(() => this.checkAllowed(), this.CHECK_ALLOWED_TIMEOUT)
  }

  private async beforeRequest() {
    if (this.#lastResult) return

    for (let i = 0; i < this.MAX_LOOP_PING; i++) {
      await sleep(i * 100)
      if (this.#lastResult || (await this.client.ping())) {
        if (i > 0) {
          await this.pingLoader.load(new PingError(i))
        }
        return
      }
    }

    this.#pingsCount += this.MAX_LOOP_PING

    if (this.#pingsCount >= this.MAX_PING_COUNT) {
      if (await this.client.ping()) {
        this.#pingsCount = 0
      } else {
        this.config.allowed = false
        this.checkAllowed()
        throw new NlogsError('It was not possible to access the elasticsearch server. Transport usage is suspended')
      }
    }

    throw new PingError(this.MAX_LOOP_PING)
  }

  private pingLoaderFn = async (arr: PingError[]) => {
    const max = arr.reduce((prev, cur) => {
      if (cur.details._pingTryCount > prev.details._pingTryCount) return cur
      return prev
    }, arr[0])

    this.emit('error', max)

    try {
      if (this.#lastResult || (await this.client.ping())) {
        const errParser = max.toParser()
        await this.client.send(errParser.index, this.parseToJson(errParser))
      }
    } catch {}

    return arr
  }

  private pingLoader = new BatchLoader(this.pingLoaderFn, {
    batchTime: 300,
    cacheTime: 1,
    getKey: o => o,
    maxSize: 200,
  })

  private async afterError(err: Error, index: string, message: ElMessage) {
    const error = ProxyError.from(err, 'Failed elasticsearch request')

    if (error instanceof PingError) {
      await this.pingLoader.load(error)
    } else {
      error.setTarget(index, message)
      this.emit('error', error)
      try {
        if (this.#lastResult || (await this.client.ping())) {
          const errParser = error.toParser()
          await this.client.send(errParser.index, this.parseToJson(errParser))
          this.#lastResult = true
        }
      } catch {}
    }
  }

  async logTo(parser: Parser): Promise<boolean> {
    await waitTick()
    const index = parser.index
    const message = this.parseToJson(parser)
    this.#count++
    try {
      await this.beforeRequest()
      await this.client.send(parser.index, message)
      this.#lastResult = true
      return true
    } catch (err) {
      this.#lastResult = false
      await this.afterError(err, index, message)

      return false
    } finally {
      this.#count--
    }
  }
}
