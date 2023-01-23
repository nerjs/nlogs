import { Meta } from './meta'
import { Details } from './details'

class Entities {
  time: number[] = []
  error: number[] = []
  highlight: number[] = []
}

export class LogInfo {
  readonly entities = new Entities()
  show?: boolean
  index?: string
  readonly details = new Details()
  readonly messages: any[] = []
  message: string = ''

  constructor(readonly meta: Meta) {
    this.index = meta.index
  }

  push(value: any) {
    this.messages.push(value)
  }

  entity(type: keyof Entities, value: any) {
    this.entities[type].push(this.messages.length)
    this.push(value)
  }
}
