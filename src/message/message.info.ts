import { Details } from './details'
import { Meta } from './meta'
import { TimeRange } from './time.range'

export class MessageInfo {
  readonly messages: any[] = []
  constructor(readonly meta: Meta, readonly details: Details, messages?: any[]) {
    if (messages) this.messages = messages
  }

  get level() {
    return this.meta.level
  }

  get timestamp() {
    return this.meta.timestamp
  }

  get depth(): number | undefined {
    return this.details._depth
  }

  get timeRange(): TimeRange | undefined {
    return this.details._timeRange
  }

  #show: boolean = true
  get show() {
    return this.#show
  }

  setShow(value: boolean) {
    this.#show = value
  }

  push(...values: any) {
    this.messages.push(...values)
  }
}
