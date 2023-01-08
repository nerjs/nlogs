import { ModDetails } from '../message/mod.details'

export class Mod extends ModDetails {
  constructor(readonly type: 'app' | 'module', name: string, version: string, readonly pathname: string) {
    super(name, version)
  }

  get id() {
    return `${this.name}@${this.version}`
  }

  toJSON() {
    const { pathname, id, ...obj } = this
    return {
      id,
      ...obj,
    }
  }
}
