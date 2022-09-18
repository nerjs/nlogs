import 'colors'
import { Base } from './Base'
import { Parser } from './Parser'

export class Transport extends Base {
  logToConsole(parser: Parser) {
    console.log(parser.toDevConsole())
  }

  logToFile(parser: Parser) {
    console.log('file'.red, parser)
  }

  logToElasticsearch(parser: Parser) {
    console.log('elasticsearch', parser)
  }

  log(...msgs: any[]) {
    const parser = new Parser()
    parser.parse(msgs)

    if (parser.allowed.console) this.logToConsole(parser.clone())
    if (parser.allowed.file) this.logToFile(parser.clone())
    if (parser.allowed.elasticsearch) this.logToElasticsearch(parser.clone())
  }
}
