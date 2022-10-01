import EventEmitter from 'events'
import { DEFAULT_PROJECT } from '../config/constants'
import { createStream, RotatingFileStream } from 'rotating-file-stream'
import { ensureDir } from '../helpers/file'
import { padTimeItem } from '../helpers/string'
import { join } from 'path'
import { ProxyError } from './errors'
import { config } from '../config'

export class FilesTransport extends EventEmitter {
  readonly startFolder = [
    'nlogs',
    [config.main.project !== DEFAULT_PROJECT && config.main.project, config.main.service]
      .filter(Boolean)
      .map(s => s.replace(/[\s,\.]/g, '_'))
      .join('_'),
  ].join('/')

  constructor() {
    super()
    this.setMaxListeners(0)
  }

  private createStream() {
    if (!config.file.allowed) return
    ensureDir(config.file.config.path)
    this.fileStream = createStream(
      (time: Date, index: number) => {
        if (!time) return 'nlogs.log'
        const folder = `${time.getFullYear()}-${padTimeItem(time.getMonth(), 'm')}-${padTimeItem(time.getDate(), 'd')}`
        const name = `${padTimeItem(time.getHours(), 'h')}-${index}`
        return `${folder}/${name}-${config.main.root.name}.log.gz`
      },
      {
        ...config.file.config,
        path: join(config.file.config.path, this.startFolder),
      },
    )
    this.fileStream.on('error', err => {
      this.emit('error', ProxyError.from(err))
    })
  }

  private fileStream: RotatingFileStream
  get stream(): RotatingFileStream | null {
    if (!config.file.allowed) return null
    if (!this.fileStream) this.createStream()

    return this.fileStream
  }

  write(line: string) {
    if (!this.stream) return
    this.stream.write(line)
    this.stream.write('\n')
  }
}
