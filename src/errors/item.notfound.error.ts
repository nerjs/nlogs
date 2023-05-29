import { ItemNlogsError } from './item.nlogs.error'

export class ItemNotFoundError extends ItemNlogsError {
  constructor(name: string, id: string) {
    const message = `${name} with id ${id} not found`
    super(message, { name, id })
  }
}
