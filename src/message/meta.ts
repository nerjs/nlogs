export class Meta {
  constructor(
    readonly project: string,
    readonly service: string,
    readonly category: string,
    readonly level: string,
    readonly traceId: string,
    readonly timestamp: Date,
    readonly index?: string,
  ) {}

  set(key: string, value: any) {
    this[key] = value
  }

  clone() {
    return new Meta(this.project, this.service, this.category, this.level, this.traceId, this.timestamp, this.index)
  }
}
