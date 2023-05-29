import { NlogsError } from './nlogs.error'

export class FsNlogsError extends NlogsError {
  readonly code = 'FS_NLOGS_ERR'
}
