export class Mod {
  constructor(
    readonly type: 'app' | 'module',
    readonly name: string,
    readonly version: string,
    readonly pathname: string,
    readonly dependencies: Set<string>,
  ) {}

  get id() {
    return `${this.name}@${this.version}`
  }
}
