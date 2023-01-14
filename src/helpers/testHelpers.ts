import { LogInfo } from '../message/log.info'
import { Meta } from '../message/meta'
import { LogReader } from '../utils/log.reader'
import { StaticLogger } from '../utils/static.logger'
import { StringFormatter } from '../utils/string.formatter'
import { ILogger } from './types'

export const meta = new Meta('project', 'service', 'category', 'debug', 'traceId', new Date(), 'index')
export const stringFormatter = new StringFormatter()
export const stringReader = new LogReader(stringFormatter)

export const stringLogFn = jest.fn((str: string) => str)
export const infoLogFn = jest.fn((info: LogInfo) => stringLogFn(stringFormatter.format(info)))
export const testLogger: ILogger = {
  log: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('log'), ...msgs]))),
  debug: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('debug'), ...msgs]))),
  trace: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('trace'), ...msgs]))),
  info: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('info'), ...msgs]))),
  warn: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('warn'), ...msgs]))),
  error: jest.fn((...msgs: any[]) => infoLogFn(stringReader.read(meta, [StaticLogger.level('error'), ...msgs]))),
}
export const clearMocks = () => {
  ;[stringLogFn, infoLogFn, ...Object.values(testLogger)].forEach((fn: jest.Mock) => {
    fn.mockClear()
  })
}
