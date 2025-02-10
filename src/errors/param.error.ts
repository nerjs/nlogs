import { prettyList, prettyValue } from '../helpers/string'
import { NlogsError } from './nlogs.error'

export class ParamNlogsError extends NlogsError<string | string[]> {
  readonly code = 'PARAM_NLOGS_ERR'

  constructor(
    readonly source: string,
    params: string | string[],
  ) {
    super(`Not valid parameter ${prettyList(params)} for ${prettyValue(source)}.`, params)
  }
}
