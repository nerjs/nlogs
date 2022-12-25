import { NlogsError } from './nlogs.error'

export class ItemNlogsError extends NlogsError {
  readonly code: 'ITEM_NLOGS_ERR'
}
