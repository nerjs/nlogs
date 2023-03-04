import { BaseLogger, IBaseLoggerOptions } from './base.logger'
import { maybeTemplate, Template } from './helpers/template'
import { MetaInfo } from './helpers/types'
import { LogInfo } from './message/log.info'

export interface ITemplateLoggerOptions extends IBaseLoggerOptions {}

export type MainTemplate = Template<((info: LogInfo) => any) | number | string | boolean | symbol | Date | Error | MetaInfo>

export class TemplateLogger extends BaseLogger<ITemplateLoggerOptions> {
  private templateString: MainTemplate

  setTemplate(...tmp: MainTemplate) {
    this.templateString = tmp

    console.log([...tmp[0][0]])
  }

  protected readMessages(level: string, std: string, msgs: any[]) {
    const mainInfo = super.readMessages(level, std, maybeTemplate(msgs))
    const tmp = this.templateString.map(val => {
      if (typeof val === 'function') return val(mainInfo)
      return val
    })

    return super.readMessages(level, std, maybeTemplate(tmp))
  }
}
