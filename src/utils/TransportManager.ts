import BatchLoader from '@nerjs/batchloader'
import 'colors'
import { ElasticsearchTransport } from './ElasticsearchTransport1'
import { PingError, ProxyError } from './errors'
import { FilesTransport } from './FilesTransport'
import { Parser } from './Parser'

export class TransportManager {
  private readonly fileTransport = new FilesTransport()
  private readonly elasticsearchTransport = new ElasticsearchTransport()

  private elasticsearchPingLoader = new BatchLoader(
    async (arr: PingError[]) => {
      const maxError = arr.reduce((e, cur) => {
        if (cur.details._pingTryCount > e.details._pingTryCount) return cur
        return e
      }, arr[0])

      this.logToConsole(maxError.toParser())

      return arr
    },
    {
      batchTime: 200,
      cacheTime: 10,
      getKey: o => o,
      maxSize: 1000,
    },
  )

  constructor() {
    this.fileTransport.on('error', (err: Error) => {
      const error = ProxyError.from(err)
      this.logToConsole(error.toParser())
    })

    this.elasticsearchTransport.on('ping-error', err => this.elasticsearchPingLoader.load(err))
    this.elasticsearchTransport.on('error', err => {
      const error = ProxyError.from(err)
      const parser = error.toParser()
      if (!process.env.ELASTICSEARCH_DETAILED_REPORT) {
        if (process.env.NODE_ENV === 'production') parser.allowedDetails(['_error'])
        else parser.clearDetails()
      }
      this.logToConsole(parser)
    })
  }

  logToConsole(parser: Parser) {
    const method = ['warn', 'error'].includes(parser.level.toLowerCase()) ? parser.level.toLowerCase() : 'log'
    if (process.env.NODE_ENV === 'production') {
      console[method](parser.toConsole())
    } else {
      console[method](parser.toDevConsole())
    }
  }

  logToFile(parser: Parser) {
    this.fileTransport.write(parser.toFile())
  }

  logToElasticsearch(parser: Parser) {
    this.elasticsearchTransport.send(parser.toElasticsearch())
  }

  log(...msgs: any[]) {
    const parser = new Parser()
    parser.parse(msgs)
    if (parser.allowed.console) this.logToConsole(parser.clone())
    if (parser.allowed.file) this.logToFile(parser.clone())
    if (parser.allowed.elasticsearch) this.logToElasticsearch(parser.clone())
  }
}
