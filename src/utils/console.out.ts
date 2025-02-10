import { Writable } from 'stream'
import { IOutLogger } from './types'

export class ConsoleOut implements IOutLogger {
  private readonly stderr: Writable
  constructor(
    private readonly stdout: Writable,
    stderr?: Writable,
  ) {
    this.stderr = stderr || stdout
  }

  out(str: string): void {
    this.stdout.write(str)
    this.stdout.write('\n')
  }

  error(str: string): void {
    this.stderr.write(str)
    this.stderr.write('\n')
  }
}
