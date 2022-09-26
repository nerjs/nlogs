import type { Transport } from './Transport'
import EventEmitter from 'events'
import {
  CURRENT_PROJECT,
  CURRENT_SERVICE,
  DEFAULT_PROJECT,
  FILES,
  FILES_DIRECTORY,
  FILES_MAX_FILES,
  FILES_MAX_SIZE,
  FILES_SIZE,
} from '../constants'
import { createStream, RotatingFileStream } from 'rotating-file-stream'
import { ensureDir } from '../helpers/file'
import { padTimeItem } from '../helpers/string'
import { defaultLogDirectory, LogDirType, ROOT_NAME } from '../helpers/package'
import { join } from 'path'
import { ProxyError } from './errors'

export class FilesTransport extends EventEmitter {
  allowedWrite: boolean = false
  logDirectory: string = FILES_DIRECTORY
  readonly startFolder = [
    'nlogs',
    [CURRENT_PROJECT !== DEFAULT_PROJECT && CURRENT_PROJECT, CURRENT_SERVICE]
      .filter(Boolean)
      .map(s => s.replace(/[\s,\.]/g, '_'))
      .join('_'),
  ].join('/')

  constructor(private readonly transport: Transport) {
    super()
    this.setup()
    this.setMaxListeners(0)
  }

  private setup() {
    if (['false', '0'].includes(FILES)) return
    if (process.env.NODE_ENV === 'production') this.allowedWrite = true
    else if (this.logDirectory || FILES) this.allowedWrite = true

    if (!this.allowedWrite) return
    if (!this.logDirectory) {
      const type: LogDirType =
        !FILES || ['true', '1'].includes(FILES) || !['home', 'user', 'project'].includes(FILES)
          ? process.env.NODE_ENV === 'production'
            ? 'home'
            : 'project'
          : (FILES as LogDirType)

      this.logDirectory = defaultLogDirectory(type)
    }
  }

  private createStream() {
    ensureDir(this.logDirectory)
    this.fileStream = createStream(
      (time: Date, index: number) => {
        if (!time) return 'nlogs.log'
        const folder = `${time.getFullYear()}-${padTimeItem(time.getMonth(), 'm')}-${padTimeItem(time.getDate(), 'd')}`
        const name = `${padTimeItem(time.getHours(), 'h')}-${index}`
        return `${folder}/${name}-${ROOT_NAME}.log.gz`
      },
      {
        compress: true,
        history: 'history.log',
        path: join(this.logDirectory, this.startFolder),
        omitExtension: true,
        maxFiles: FILES_MAX_FILES,
        size: FILES_SIZE,
        maxSize: FILES_MAX_SIZE,
      },
    )
    this.fileStream.on('error', err => {
      this.emit('error', ProxyError.from(err))
    })
  }

  private fileStream: RotatingFileStream
  get stream(): RotatingFileStream | null {
    if (!this.allowedWrite) return null
    if (!this.fileStream) this.createStream()

    return this.fileStream
  }

  write(line: string) {
    if (!this.stream) return
    this.stream.write(line)
    this.stream.write('\n')
  }
}
