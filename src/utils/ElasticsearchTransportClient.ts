import { Client, HttpConnection } from '@elastic/elasticsearch'
import { BulkOperationType, BulkResponse, BulkResponseItem } from '@elastic/elasticsearch/lib/api/types'
import { HttpAgentOptions } from '@elastic/transport/lib/types'
import BatchLoader from '@nerjs/batchloader'
import EventEmitter from 'events'
import { BulkErrorResponse, ElasticsearchBulkError, ElasticsearchHttpError, ProxyError } from './errors'
import { ElMessage } from './types'
import { ElasticseaarchConfig } from '../config/types'

interface BulkMessage<T extends BulkOperationType = BulkOperationType> {
  index: string
  id?: string
  type: T
  data: any
}

export class ElasticsearchTransportClient extends EventEmitter {
  readonly client: Client

  constructor(readonly config: ElasticseaarchConfig) {
    super()
    const agent: HttpAgentOptions = {
      keepAlive: true,
      keepAliveMsecs: 10000,
      maxFreeSockets: 100,
      maxSockets: 1000,
      // connections: 1000,
    }

    try {
      this.client = new Client({
        ...this.config,
        sniffOnStart: false,
        sniffInterval: false,
        Connection: HttpConnection,
        agent,
      })
    } catch (err) {
      this.emit('error', new ProxyError(err, 'Something went wrong when configuring the elasticsearch client'))
    }
  }

  async bulk(operations: BulkMessage[]): Promise<BulkResponse> {
    return await this.client.bulk({
      operations: operations
        .map(({ index, type, data, id }) => [
          {
            [type]: Object.assign({ _index: index }, id && { _id: id }),
          },
          data,
        ])
        .flat(),
    })
  }

  private bulkBatchLoaderFn = async (arr: BulkMessage[]) => {
    const response = await this.bulk(arr)
    return response.items
  }

  private readonly bulkLoader = new BatchLoader(this.bulkBatchLoaderFn, {
    batchTime: 100,
    cacheTime: 1,
    getKey: o => o,
    maxSize: 100,
  })

  async sendToBulk<T extends BulkOperationType>(msg: BulkMessage<T>) {
    try {
      const { [msg.type]: res } = (await this.bulkLoader.load(msg)) as Record<T, BulkResponseItem>
      if (res.error && typeof res.error === 'object') throw new ElasticsearchBulkError(res as BulkErrorResponse, msg.index, msg.data)
    } catch (err) {
      const error = ElasticsearchHttpError.from(err, msg.index, msg.data)
      throw error
    }
  }

  async send(index: string, data: ElMessage) {
    await this.sendToBulk({
      index,
      type: 'create',
      data,
    })
  }

  private pingBatchLoaderFn = async (arr: any[]) => {
    let res = false

    try {
      res = await this.client.ping()
    } catch (err) {
      this.emit('error', new ElasticsearchHttpError(err))
      res = false
    }
    return Array(arr.length).fill(!!res)
  }

  private readonly pingLoader = new BatchLoader(this.pingBatchLoaderFn, {
    batchTime: 100,
    cacheTime: 10,
    getKey: o => o,
    maxSize: 10000,
  })

  async ping() {
    if (!this.client) return false
    return this.pingLoader.load(Date.now())
  }
}
