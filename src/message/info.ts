import { Details } from './details'
import { Meta } from './meta'

export class Info {
  constructor(readonly meta: Meta, readonly messages: any[], readonly details: Details) {}
}
