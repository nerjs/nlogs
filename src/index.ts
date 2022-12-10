import { join } from 'path'
import { Base } from './utils/Base'
import { ConsoleTransport } from './utils/ConsoleTransport'
import { ElasticsearchTransport } from './utils/ElasticsearchTransport'
import { ProxyError } from './utils/errors'
import { FilesTransport } from './utils/FilesTransport'
import { Parser } from './utils/Parser'

const parser = new Parser()

const consoleTransport = new ConsoleTransport({
  allowed: true,
  config: {
    format: 'full',
  },
  debug: {
    allowed: true,
    only: true,
    categories: [],
    modules: ['f', 'zzz'],
  },
})

const fileTransport = new FilesTransport({
  allowed: true,
  config: {
    compress: true,
    format: 'line',
    history: 'dddd.log',
    maxFiles: 3,
    maxSize: '10M',
    omitExtension: true,
    path: join(__dirname, '..', 'logs'),
    size: '1M',
  },
  debug: {
    allowed: false,
    categories: [],
    modules: [],
    only: false,
  },
})

const elasticsearchTransport = new ElasticsearchTransport({
  allowed: true,
  debug: {
    allowed: true,
    only: false,
    categories: [],
    modules: [],
  },
  config: {
    cloud: {
      id: 'logs:ZXVyb3BlLXdlc3QzLmdjcC5jbG91ZC5lcy5pbzo0NDMkZDEwZjYxMjcwOTc2NDIwOWI4NmIwMWY1ZmM4ZGY5MmEkMjJiZTYzMmYxNmI4NDljMWEwODJiOWM3Zjc0NDk3YWQ=',
    },
    auth: {
      apiKey: 'X3BCblhJTUJ0ZFA2RFV5WkhRMjU6MloydFV3SERTS2lsSEpqZ0ZHcHpDUQ==',
    },
  },
})

elasticsearchTransport.on('error', err => {
  const error = ProxyError.from(err)
  consoleTransport.log(error.toParser())
})

// console.log(fileTransport)
;(async () => {
  parser.parse([
    Base.time(123000),
    Base.level('info'),
    'test message',
    Base.module('zzz'),
    Base.project('gg'),
    Base.service('dd'),
    Base.category('gggg'),
  ])

  console.log('console', await consoleTransport.log(parser))
  console.log('file', await fileTransport.log(parser))
  console.log('elasticsearch', await elasticsearchTransport.log(parser))
})()
