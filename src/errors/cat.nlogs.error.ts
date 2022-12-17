import { NlogsError } from './nlogs.error'

export class CatNlogsError extends NlogsError {
  readonly code = 'CAT_NLOGS_ERR'
}
