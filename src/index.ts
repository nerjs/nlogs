import { Base } from './message/Base'
import { Details } from './message/Details'
import { iterateKeys, setDepth } from './utils/object'

const base = new Base()
const from = {
  s: 1,
  a: {
    t: 1,
    b: {
      r: 3,
      c: 1,
    },
  },
}
const details = new Details(base, from)
// details.rename('a.t')
iterateKeys('a.b.r', from, console.info.bind(null, 'iterate'))
console.log(from)
