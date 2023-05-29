import prettyTime from 'pretty-time'

export class TimeDetails {
  readonly pretty: string
  constructor(readonly ms: number, readonly label?: string) {
    this.pretty = prettyTime(1000000 * ms, 'ms')
  }
}
