const merge = require('merge')
const Transport = require('../Transport')
const StreamManager = require('../utils/StreamManager')

class StreamTransport extends Transport {
    /** @type {StreamTransportOptions} */
    options = null

    /**
     * @param {StreamTransportOptions} [options]
     */
    constructor(options) {
        super(
            merge(
                true,
                {
                    limitBytes: 65536,
                    errorAfterLimit: true,
                    encoding: 'utf8',
                    separator: '\n',
                },
                options,
            ),
        )

        this.stream = new StreamManager({
            ...this.options,
            createStream: this.createStream.bind(this),
        })
    }

    /**
     *
     * @param {String|Buffer} val
     */
    write(val) {
        return this.stream.write(val)
    }

    pipe(stream) {
        return this.stream.pipe(stream)
    }

    unpipe(stream) {
        return this.stream.unpipe(stream)
    }

    log(msg) {
        const str = `${JSON.stringify(this.prepareMessage(msg))}${this.options.separator}`
        this.write(str)
    }

    createStream() {
        throw new Error('createStream not implemented')
    }
}

module.exports = StreamTransport

/**
 * @typedef {Object} OnlyStreamTransportOptions
 * @property {String} [separator="\n"] Разделитель сообщений
 */

/**
 * @typedef {import("../utils/StreamManager").StreamManagerOptions | OnlyStreamTransportOptions} StreamTransportOptions
 */
