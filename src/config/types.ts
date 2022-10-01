import { ClientOptions } from '@elastic/elasticsearch'

export interface MainConfig {
  project: string
  service: string
  category: {
    default: string
    system: string
  }
  index: {
    logs: string
    system: string
  }
  env: 'production' | 'development' | string
  root: {
    pathname: string
    name: string
    version: string
  }
  logger: {
    version: string
    pathname: string
  }
}

export interface DebugConfig {
  allowed: boolean
  only: boolean
  categories: string[]
  modules: string[]
}

export interface ConsoleConfig {
  levels: string[]
  format: 'full' | 'simple' | 'json'
}

export interface FileConfig {
  compress: boolean
  history: string
  path: string
  omitExtension: true
  maxFiles: number
  size: string
  maxSize: string
}

export interface ElasticseaarchConfig extends Pick<ClientOptions, 'node' | 'nodes' | 'cloud' | 'auth'> {}

export interface TransportConfig<T> {
  allowed: boolean
  debug: DebugConfig
  config: T
}

export interface Config {
  main: MainConfig
  console: TransportConfig<ConsoleConfig>
  file: TransportConfig<FileConfig>
  elasticsearch: TransportConfig<ElasticseaarchConfig>
  meta: Record<string, any>
}
