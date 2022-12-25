import { ItemNlogsError } from './item.nlogs.error'

export class ItemExistsError extends ItemNlogsError {
  constructor(name: string, id?: string) {
    const message = `${name}${id ? ` with id ${id}` : ''} already exists`
    super(message, { name, id })
  }
}
