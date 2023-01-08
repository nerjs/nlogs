export class Meta {
  #show: boolean = true
  get show() {
    return this.#show
  }
  set show(val: boolean) {
    this.#show = val
  }
  #index?: string
  get index() {
    return this.#index
  }
  set index(val: string) {
    this.#index = val
  }
  constructor(
    readonly project: string,
    readonly service: string,
    readonly category: string,
    readonly level: string,
    readonly traceId: string,
    readonly timestamp: Date,
    index?: string,
  ) {
    this.index = index
  }

  set<K extends keyof Meta>(key: K, value: Meta[K]) {
    Object.assign(this, {
      [key]: value,
    })
  }

  clone() {
    return new Meta(this.project, this.service, this.category, this.level, this.traceId, this.timestamp, this.index)
  }
}
