import { Base } from './Base'
import { IS_MESSAGE, IS_META, LEVEL } from './symbols'

export class Transport extends Base {
  log(...msgs: any[]) {
    console.log(
      msgs.map(msg => {
        if (Base.isMeta(msg) || Base.isMessage(msg)) {
          delete msg[IS_META]
          delete msg[IS_MESSAGE]
          const key = Object.getOwnPropertySymbols(msg)[0]
          return [key, msg[key]]
        } else {
          return msg
        }
      }),
    )
  }
}
