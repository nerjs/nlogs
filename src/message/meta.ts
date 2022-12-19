export class Meta {
  constructor(
    readonly project: string,
    readonly service: string,
    readonly category: string,
    readonly level: string,
    readonly traceId: string,
    readonly timestamp: Date,
    readonly module?: string,
    readonly index?: string,
  ) {}

  set<K extends keyof Meta>(key: K, value: Meta[K]) {
    Object.assign(this, {
      [key]: value,
    })
  }

  clone() {
    return new Meta(this.project, this.service, this.category, this.level, this.traceId, this.timestamp, this.module, this.index)
  }
}
