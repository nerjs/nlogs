export class Mod {
  constructor(readonly type: 'app' | 'module', readonly name: string, readonly version: string, readonly pathname: string) {}

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
