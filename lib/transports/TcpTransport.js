const net = require('net')
const merge = require('merge')

const StreamTransport = require('./StreamTransport')
const ArgumentsError = require('../errors/ArgumentsError')

class TcpTransport extends StreamTransport {
    /**
     *
     * @param {TcpTransportOptions} options
     */
    constructor(options) {
        super(
            merge(
                true,
                {
                    startEvent: 'connect',
                    stopEvent: 'close',
                    restart: false,
                },
                options,
            ),
        )

        if (!this.options.port && !this.options.path)
            throw new ArgumentsError(ArgumentsError.TYPES.REQUIRED, 'port')
    }

    async createStream(options) {
        const client = new net.Socket(options)
        client.unref()
        // client.on('error', err => console.error('fff', err))
        client.on('connect', () => console.log('connect'))
        console.log('start connect')
        client.connect(
            this.options.path || {
                port: this.options.port,
                host: this.options.host || 'localhost',
            },
        )
        // await util.promisify(client.connect).call(
        //     client,
        //     this.options.path || {
        //         port: this.options.port,
        //         host: this.options.host || 'localhost',
        //     },
        // )
        console.log('end connect')
        return client
    }
}

module.exports = TcpTransport

/**
 * @typedef {Object} OnlyTcpTransportOptions
 * @property {String} [port] Required if path is not specified
 * @property {String} [host=localhost] Required if path is not specified
 * @property {String} [path] Required if uri is not specified
 */

/**
 * @typedef {import("./StreamTransport").StreamTransportOptions | OnlyTcpTransportOptions} TcpTransportOptions
 */
