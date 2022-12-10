import EventEmitter from 'events'
import { sleep, waitTick } from '../helpers/time'
import { ElasticsearchTransportClient } from './ElasticsearchTransportClient'
import { ElasticsearchFailMessageError, ElasticsearchHttpError, NlogsError, PingError, ProxyError } from './errors'
import { ElMessage, ElMsg } from './types'

export interface ElasticsearchTransport {
  on(event: 'ping-error', callback: (error: ElasticsearchHttpError) => void): this
  on(event: 'error', callback: (error: NlogsError) => void): this
}
export class ElasticsearchTransport extends EventEmitter {
  readonly logsIndex = 'tlogs'
  readonly systemIndex = 'system_tlogs'
  private pingProcess = false
  private readonly client = new ElasticsearchTransportClient(this)

  constructor() {
    super()
    this.setMaxListeners(0)
  }

  async send(msg: ElMsg) {
    if (!this.client.ready) return
    if (!(await this.sendAllowed(msg))) return
    const { index, data } = this.createRequest(msg)
    try {
      await this.client.send(index, data)
    } catch (err) {
      await this.parseResponse(index, data, err)
    }
  }

  private async sendAllowed(msg: ElMsg): Promise<boolean> {
    await waitTick()
    if (this.client.successedLastResult || (await this.client.ping())) return true
    const PING_MULTIPLIER = this.pingProcess ? 500 : 100
    const PING_MAX_COUNT = this.pingProcess ? 5 : 10
    this.pingProcess = true

    for (let i = 0; i < PING_MAX_COUNT; i++) {
      await sleep(PING_MULTIPLIER * i)
      if (!this.client.successedLastResult && !(await this.client.ping())) continue

      await this.sendUnsuccessful(new PingError(i))
      return true
    }

    this.emit('ping-error', new PingError(PING_MAX_COUNT))
    await this.sendUnsuccessful(new ElasticsearchFailMessageError(msg, `Попытка максимально пропинговать. count=${PING_MAX_COUNT}`))

    this.pingProcess = false
    return false
  }

  private createRequest(msg: ElMsg, currentIndex = this.logsIndex): { index: string; data: ElMessage } {
    const data: ElMessage = {
      ...msg,
      details: msg.details || {},
      ['@timestamp']: msg.meta.timestamp || new Date(),
    }
    const index = `${['warn', 'error'].includes(msg.meta.level) ? 'stderr' : 'stdout'}_${currentIndex}_${msg.meta.project}_${
      msg.meta.service
    }`

    return { index, data }
  }

  private async parseResponse(_index: string, _data: ElMessage, err: Error) {
    const error = ProxyError.from(err)
    await this.sendUnsuccessful(error)
  }

  private async sendUnsuccessful(err: NlogsError) {
    this.emit('error', err)
    if (!this.client.successedLastResult) return
    const { index, data } = this.createRequest(err.toJSON(), this.systemIndex)

    try {
      await this.client.send(index, data)
    } catch (e) {
      this.emit('error', ProxyError.from(e))
    }
  }
}
