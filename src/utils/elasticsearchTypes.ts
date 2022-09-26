export interface ShardFailure {
  index?: string
  node?: string
  reason: ErrorCause
  shard: number
  status?: string
}

export type ErrorCause = ErrorCauseKeys & {
  [property: string]: any
}

export interface ShardStatistics {
  failed: number
  successful: number
  total: number
  failures?: ShardFailure[]
  skipped?: number
}

export interface ErrorCauseKeys {
  type: string
  reason?: string
  stack_trace?: string
  caused_by?: ErrorCause
  root_cause?: ErrorCause[]
  suppressed?: ErrorCause[]
}

export interface InlineGetKeys<TDocument = unknown> {
  fields?: Record<string, any>
  found: boolean
  _seq_no?: number
  _primary_term?: number
  _routing?: string
  _source: TDocument
}

export type InlineGet<TDocument = unknown> = InlineGetKeys<TDocument> & {
  [property: string]: any
}

export type BulkOperationType = 'index' | 'create' | 'update' | 'delete'

export interface BulkResponseItem {
  _id?: string | null
  _index: string
  status: number
  error?: ErrorCause
  _primary_term?: number
  result?: string
  _seq_no?: number
  _shards?: ShardStatistics
  _version?: number
  forced_refresh?: boolean
  get?: InlineGet<Record<string, any>>
}

export interface BulkResponse {
  errors: boolean
  items: Partial<Record<BulkOperationType, BulkResponseItem>>[]
  took: number
  ingest_took?: number
}
