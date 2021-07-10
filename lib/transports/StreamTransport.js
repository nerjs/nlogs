const { PassThrough } = require('stream')
const merge = require('merge')
const Transport = require('../Transport')
const LimitError = require('../utils/LimitError')

class StreamTransport extends Transport {
    /**
     *
     * @param {Object} [options]
     * @param {Number} [options.limitBytes=65536]
     * @param {Boolean} [options.errorAfterLimit=true]
     * @param {String} [options.encoding=utf8]
     * @param {String} [options.separator="\n"]
     */
    constructor(options) {
        super()
        this.options = merge(
            true,
            {
                limitBytes: 65536,
                errorAfterLimit: true,
                encoding: 'utf8',
                separator: '\n',
            },
            options,
        )

        this.stream = new PassThrough({
            highWaterMark: this.options.limitBytes,
        })
    }

    get size() {
        return this.stream._readableState.length
    }

    write(val) {
        const buffer = (() => {
            if (val instanceof Buffer) return val
            if (typeof val !== 'string') throw new Error(`Incorrect value type (${typeof val})`)
            return Buffer.from(val, this.options.encoding)
        })()

        if (this.options.errorAfterLimit && buffer.length + this.size >= this.options.limitBytes)
            throw new LimitError('Exceeding the established limit', this.options.limitBytes, 'byte')

        return this.stream.write(buffer)
    }

    pipe(stream) {
        return this.stream.pipe(stream)
    }

    unpipe(stream) {
        return this.stream.unpipe(stream)
    }

    log(msg) {
        const str = `${this.options.separator}${JSON.stringify(this.prepareMessage(msg))}`
        this.write(str)
    }
}

module.exports = StreamTransport
