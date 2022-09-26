import { Client, ClientOptions, HttpConnection, UndiciConnection } from '@elastic/elasticsearch'
import { BulkOperationType, BulkResponse, BulkResponseItem } from '@elastic/elasticsearch/lib/api/types'
import { HttpAgentOptions, UndiciAgentOptions } from '@elastic/transport/lib/types'
import BatchLoader from '@nerjs/batchloader'
import EventEmitter from 'events'
import { BulkErrorResponse, ElasticsearchBulkError, ElasticsearchHttpError, NotInitializedError } from './errors'
import { ElMessage } from './types'

interface BulkMessage<T extends BulkOperationType = BulkOperationType> {
  index: string
  id?: string
  type: T
  data: any
}

export class ElasticsearchTransportClient {
  successedLastResult = true
  private elasticsearchClient?: Client
  get client(): Client | null {
    if ('elasticsearchClient' in this) return this.elasticsearchClient
    const options: ClientOptions = ElasticsearchTransportClient.getBaseOptions()
    if (!options) {
      this.elasticsearchClient = null
      return null
    }

    const agent: HttpAgentOptions = {
      keepAlive: true,
      keepAliveMsecs: 10000,
      maxFreeSockets: 100,
      maxSockets: 1000,
      // connections: 1000,
    }

    this.elasticsearchClient = new Client({
      ...options,
      sniffOnStart: false,
      sniffInterval: false,
      Connection: HttpConnection,
      agent,
      // agent: ElasticsearchTransportClient.getAgent(options),
    })

    return this.elasticsearchClient
  }

  get wasInitialized() {
    return 'elasticsearchClient' in this
  }

  get ready() {
    return !!this.client
  }

  constructor(private readonly parent: EventEmitter) {}

  async bulk(operations: BulkMessage[]): Promise<BulkResponse> {
    if (!this.client) throw new NotInitializedError('elasticsearch', 'bulk')
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
    try {
      const response = await this.bulk(arr)
      this.successedLastResult = true
      return response.items
    } catch (err) {
      this.successedLastResult = false
      throw err
    }
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
      this.successedLastResult = true
    } catch (err) {
      this.successedLastResult = false
      this.parent.emit('ping-error', new ElasticsearchHttpError(err))
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

  static getBaseOptions(): Pick<ClientOptions, 'auth' | 'cloud' | 'node' | 'nodes'> | null {
    const {
      ELASTICSEARCH_API_KEY,
      ELASTICSEARCH_CLOUD_ID,
      ELASTICSEARCH_NODE,
      ELASTICSEARCH_NODES,
      ELASTICSEARCH_USER,
      ELASTICSEARCH_PASSWORD,
    } = process.env

    const options: Pick<ClientOptions, 'auth' | 'cloud' | 'node' | 'nodes'> = {}

    if (ELASTICSEARCH_CLOUD_ID) options.cloud = { id: ELASTICSEARCH_CLOUD_ID }
    if (ELASTICSEARCH_NODE && !options.cloud) options.node = ELASTICSEARCH_NODE
    if (ELASTICSEARCH_NODES && !options.cloud && !options.node) options.nodes = ELASTICSEARCH_NODES

    if (ELASTICSEARCH_API_KEY) options.auth = { apiKey: ELASTICSEARCH_API_KEY }
    if ((ELASTICSEARCH_USER || ELASTICSEARCH_PASSWORD) && !options.auth)
      options.auth = {
        username: ELASTICSEARCH_USER,
        password: ELASTICSEARCH_PASSWORD,
      }

    return Object.keys(options).length ? options : null
  }

  static getAgent(_options: ClientOptions) {
    return undefined
  }
}
