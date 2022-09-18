import { DEFAULT_PROJECT } from '../constants'
import type { Category } from './Cetegory'
import type { Paths } from './Paths'

export class Index {
  isStrict: boolean = false
  constructor(private readonly paths: Paths, private readonly category: Category) {}

  get name() {
    return [this.paths.project === DEFAULT_PROJECT ? null : this.paths.project, this.paths.service, this.isStrict && this.category.name]
      .filter(Boolean)
      .join('_')
      .toLowerCase()
  }

  strict(value: boolean = true) {
    this.isStrict = !!value
  }
}
