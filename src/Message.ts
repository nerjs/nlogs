import type { Format } from './Format'

export class Message {
  constructor(private readonly format: Format, private readonly data: any[]) {}
}
