import { Base } from './Base'
import { v4 as uuid } from 'uuid'
import { ILogger, LogTime } from './types'

export class LogTimer {
  private readonly startTimestamp = Date.now()
  private lastTimestamp = Date.now()
  constructor(
    private readonly logger: ILogger,
    private label?: string | null,
    private readonly onEnd?: (time: number, label?: string | null) => any,
  ) {}

  start(...msgs: any[]) {
    this.logger.debug(...[Base.allowed(false), Base.highlight('timeStart'), this.label, Base.datetime(new Date())].filter(Boolean), ...msgs)
    this.lastTimestamp = Date.now()
  }

  log(...msgs: any[]) {
    this.logger.debug(...[Base.highlight('timeLog'), this.label, Base.time(Date.now() - this.lastTimestamp)].filter(Boolean), ...msgs)
    this.lastTimestamp = Date.now()
  }

  end(...msgs: any[]) {
    const time = Date.now() - this.startTimestamp
    this.logger.debug(...[Base.highlight('timeEnd'), this.label, Base.time(time)].filter(Boolean), ...msgs)
    this.onEnd?.(time, this.label)
  }
}

export class LogTimerManager {
  private readonly labels = new Map<string, LogTimer>()
  constructor(private readonly logger: ILogger) {}

  time(label?: string): LogTime
  time(label?: string, ...msgs: any[]): LogTime
  time(...msgs: any[]): LogTime
  time(...msgs: any[]): LogTime {
    const timeLabel = msgs[0] && typeof msgs[0] === 'string' ? msgs.shift() : null
    const timeId = timeLabel || uuid()

    const timer = new LogTimer(this.logger, timeLabel, () => {
      this.labels.delete(timeId)
    })
    this.labels.set(timeId, timer)
    timer.start(...msgs)

    const log = (...logMsgs: any[]) => {
      timer.log(...logMsgs)
      return end
    }
    const end = (...endMsgs: any[]) => {
      timer.end(...endMsgs)
      return end
    }

    end.log = log
    end.end = end

    return end
  }

  private checkLabel(methodName: 'log' | 'end', label?: any): string | null {
    const timeLabel = label && typeof label === 'string' ? label : null

    if (!timeLabel) {
      this.logger.warn(Base.highlight(methodName), 'You cannot call the log and end methods of a timer without a label')
      return null
    } else if (!this.labels.has(timeLabel)) {
      this.logger.warn(
        Base.highlight(methodName),
        'The',
        Base.highlight(timeLabel),
        'tag was not found. The tag has not been set or the timer has already been completed',
      )
      return null
    }

    return timeLabel
  }

  log(label: string, ...msgs: any[]) {
    const timeLabel = this.checkLabel('log', label)
    if (!timeLabel) return
    this.labels.get(label).log(...msgs)
  }

  end(label: string, ...msgs: any[]) {
    const timeLabel = this.checkLabel('end', label)
    if (!timeLabel) return
    this.labels.get(label).end(...msgs)
  }
}
