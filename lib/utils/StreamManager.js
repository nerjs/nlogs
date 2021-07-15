const { PassThrough } = require('stream')
const merge = require('merge')
const moment = require('moment')
const { sleep, waitEmitter } = require('helpers-promise')

const ArgumentsError = require('./ArgumentsError')
const StreamError = require('./StreamError')
const LimitError = require('./LimitError')
const waitWriteStream = require('./waitWriteStream')
const getWritebleStreamBuffer = require('./getWritebleStreamBuffer')

class StreamManager extends PassThrough {
    /**
     *
     * @param {Object} [options]
     * @param {Number} [options.limitBytes=65536]
     * @param {Boolean} [options.errorAfterLimit=true]
     * @param {String} [options.encoding=utf8]
     * @param {Function} options.createStream
     * @param {Boolean} [options.startCreate]
     * @param {String} [options.startEvent]
     * @param {String} [options.stopEvent]
     * @param {Number} [options.startTimeout]
     * @param {"minute"|"hour"|"day"} [options.restart]
     */
    constructor(options) {
        const op = merge(
            true,
            { limitBytes: 65536, errorAfterLimit: true, encoding: 'utf8' },
            options,
        )
        super({
            highWaterMark: op.limitBytes,
            defaultEncoding: op.encoding,
        })

        this.options = op

        if (!this.createStream && !this.options.createStream)
            throw new ArgumentsError(ArgumentsError.TYPES.REQUIRED, 'createStream')

        this.createStream = (this.createStream || this.options.createStream).bind(this)
        this.onError = this.onError.bind(this)
        this.onStop = this.onStop.bind(this)

        this.targetStream = null
        this.started = false
        this.startProcess = false
        this.restartProcess = false
        this.stopProcess = false
        this.destroyedBuffers = null

        if (this.options.startCreate) this.wrapPromise(this.start(), 'CreateConstructor')
    }

    async wrapPromise(promise, tag) {
        try {
            return await promise
        } catch (err) {
            this.emit('error', new StreamError(tag, err))
        }
    }

    onStop(...args) {
        this.emit('onstop', ...args)
        this.wrapPromise(this.restart(), 'FailRestartFromOnStop')
    }

    onError(err) {
        this.emit('error', new StreamError('onError', err))
        if (!this.restartProcess) this.wrapPromise(this.restart(), 'FailRestartFromOnError')
    }

    write(val, encoding) {
        if (!this.targetStream && !this.options.startProcess && !this.options.restartProcess)
            this.wrapPromise(this.start(), 'StartWrite')

        if (!super.write(val, encoding))
            throw new LimitError('Exceeding the established limit', this.options.limitBytes, 'byte')

        return true
    }

    setNextRestart() {
        const curr = moment()

        switch (this.options.restart) {
            case 'day':
                curr.add(1, 'd')
                curr.startOf('day')
                break
            case 'hour':
                curr.add(1, 'h')
                curr.startOf('hour')
                break
            case 'minute':
                curr.add(1, 'm')
                curr.startOf('minute')
                break
        }

        const next = curr.valueOf()

        this.tid = setTimeout(
            () => this.wrapPromise(this.restart(), 'SetNextRestart'),
            next - Date.now(),
        )
    }

    async start() {
        if (this.startProcess) throw new StreamError('Conflict', 'startProcess is already set')
        if (this.targetStream) throw new StreamError('StopConflict', 'targetStream is already set')
        this.startProcess = true
        await sleep(1)
        this.emit('start', this.targetStream)

        const { limitBytes, encoding, stopEvent, restart } = this.options

        try {
            const targetStream = this.createStream({
                highWaterMark: limitBytes,
                defaultEncoding: encoding,
            })
            if (this.options.startEvent) {
                await waitEmitter(
                    targetStream,
                    this.options.startEvent,
                    'error',
                    this.options.startTimeout || 20000,
                )
            }

            if (this.destroyedBuffers) {
                this.destroyedBuffers.forEach(buff => targetStream.write(buff.chunk, buff.encoding))
                this.destroyedBuffers = null
            }

            this.targetStream = targetStream
            this.targetStream.on('error', this.onError)
            if (stopEvent) this.targetStream.on(stopEvent, this.onStop)
            this.pipe(this.targetStream)

            if (restart) this.setNextRestart()

            this.emit('started', this.targetStream)
        } catch (e) {
            if (!this.restartProcess) throw e
            this.restart()
        } finally {
            this.startProcess = false
        }
    }

    async stop() {
        if (this.tid) {
            clearTimeout(this.tid)
            this.tid = null
        }
        if (this.stopProcess) throw new StreamError('StopConflict', 'stopProcess is already set')
        if (!this.targetStream) throw new StreamError('StopConflict', 'targetStream not set yet ')
        if (this.destroyedBuffers)
            throw new StreamError('StopConflict', 'destroyedBuffers is already set')

        this.emit('stop', this.targetStream)

        this.stopProcess = true
        const {
            targetStream,
            options: { stopEvent },
        } = this
        this.targetStream = null

        targetStream.removeListener('error', this.onError)
        if (stopEvent) targetStream.removeListener(stopEvent, this.onStop)
        this.unpipe(targetStream)
        try {
            if (targetStream.destroyed) {
                this.destroyedBuffers = getWritebleStreamBuffer(targetStream)
            } else {
                await waitWriteStream(targetStream)
                targetStream.end()
            }

            this.emit('stoped', targetStream)
        } finally {
            this.stopProcess = false
        }
    }

    async restart() {
        if (this.restartProcess) return
        this.restartProcess = true
        this.emit('restart')

        try {
            let restartTimeout = 1000

            while (true) {
                try {
                    if (this.targetStream) {
                        await this.stop()
                    }

                    await this.start()

                    break
                } catch (e) {
                    const err = new StreamError('RestartLoop', e)
                    console.error(err)
                }
                await sleep(restartTimeout)
                restartTimeout = parseInt(restartTimeout * 1.3)
                if (restartTimeout > 10000) restartTimeout = 10000
            }
        } finally {
            this.emit('restarted')
            this.restartProcess = false
        }
    }
}

module.exports = StreamManager
