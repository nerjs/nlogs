import 'colors'
import { CURRENT_PROJECT, CURRENT_SERVICE } from '../constants'
import { Base } from './Base'
import { FilesTransport } from './FilesTransport'
import { Parser } from './Parser'

export class Transport {
  private readonly fileTransport = new FilesTransport(this)

  constructor() {
    this.fileTransport.on('error', (err: Error) => {
      this.log(
        Base.allowed({
          console: true,
          file: false,
          elasticsearch: false,
        }),
        Base.project(CURRENT_PROJECT),
        Base.service(CURRENT_SERVICE),
        Base.level('error'),
        err,
      )
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
    console.log('elasticsearch'.red, parser.level)
  }

  log(...msgs: any[]) {
    const parser = new Parser()
    parser.parse(msgs)
    if (parser.allowed.console) this.logToConsole(parser.clone())
    if (parser.allowed.file) this.logToFile(parser.clone())
    if (parser.allowed.elasticsearch) this.logToElasticsearch(parser.clone())
  }
}
