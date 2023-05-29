import { NlogsError } from './nlogs.error'

export class MsgNlogsError extends NlogsError {
  readonly code = 'MSG_NLOGS_ERR'
}
