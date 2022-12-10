import { DEFAULT_PROJECT } from '../config/constants'
import { createStream, RotatingFileStream } from 'rotating-file-stream'
import { ensureDir } from '../helpers/file'
import { padTimeItem } from '../helpers/string'
import { join } from 'path'
import { ProxyError } from './errors'
import { config } from '../config'
import { Transport } from './Transport'
import type { FileConfig } from '../config/types'
import { Parser } from './Parser'

export class FilesTransport extends Transport<FileConfig> {
  private stream: RotatingFileStream
  readonly startFolder = [
    'nlogs',
    [config.main.project !== DEFAULT_PROJECT && config.main.project, config.main.service]
      .filter(Boolean)
      .map(s => s.replace(/[\s,\.]/g, '_'))
      .join('_'),
  ].join('/')

  init() {
    const { format, path, ...streamConfig } = this.config.config
    ensureDir(path)
    this.stream = createStream(
      (time: Date, index: number) => {
        if (!time) return 'nlogs.log'
        const folder = `${time.getFullYear()}-${padTimeItem(time.getMonth(), 'm')}-${padTimeItem(time.getDate(), 'd')}`
        const name = `${padTimeItem(time.getHours(), 'h')}-${index}`
        return `${folder}/${name}-${config.main.root.name}.log.gz`
      },
      {
        ...streamConfig,
        path: join(path, this.startFolder),
      },
    )
    this.stream.on('error', err => {
      this.emit('error', ProxyError.from(err))
    })
  }

  private parsetToLine(parser: Parser) {
    return FilesTransport.toTextLine(parser, true)
  }

  private parsetToJSON(parser: Parser) {
    return FilesTransport.toJsonLine(parser, true)
  }

  #count = 0
  count() {
    return this.#count
  }

  logTo(parser: Parser): boolean {
    if (!this.stream) return false
    const { format } = this.config.config
    const message = format === 'json' ? this.parsetToJSON(parser) : this.parsetToLine(parser)
    this.#count++
    return this.stream.write(`${message}\n`, () => {
      this.#count--
    })
  }
}
