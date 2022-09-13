import { Base } from './Base'
import * as lodashHas from 'lodash.has'
import * as lodashSet from 'lodash.set'
import * as lodashGet from 'lodash.get'

export class Details {
  constructor(private readonly base: Base, private readonly obj: object, readonly depth?: number) {}

  rename(keyPath: string | string[]) {
    if (typeof keyPath === 'string') return this.rename(keyPath.split('.'))
    if (!keyPath.length) return
    const [...keys] = keyPath
    const last = keys.pop()
    let val = this.obj

    for (const key of keys) {
      if (!Object.hasOwnProperty.call(val, key) || typeof val[key] !== 'object' || !val[key]) return
      val = val[key]
    }

    if (!Object.hasOwnProperty.call(val, last)) return

    val[`${last}.\$${typeof val[last]}`] = val[last]
    delete val[last]
  }
}
