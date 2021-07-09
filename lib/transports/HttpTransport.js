// @ts-check
const merge = require('merge')
const needle = require('needle')
const Batchloader = require('@nerjs/batchloader')

const Transport = require('../Transport')
const pckg = require('../../package.json')
const HttpError = require('../utils/HttpError')

class HttpTransport extends Transport {
    /**
     * @param {HttpTransportConfig} options
     */
    constructor(options) {
        super()

        this.options = merge(
            true,
            {
                uri: null,
                method: 'POST',
                bulk: false,
                bulkSize: 10,
                bulkTime: 50,
                open_timeout: 10000,
                response_timeout: 20000,
                read_timeout: 10000,
                compressed: true,
                prepareMessage: this.prepareMessage,
                prepareData: this.prepareData,
            },
            options,
        )

        if (!this.options.uri) throw new Error('Missing required option [uri]')

        this.prepareMessage = this.options.prepareMessage.bind(this)
        this.prepareData = this.options.prepareData.bind(this)
        this.loader = null

        if (this.options.bulk) {
            this.loader = new Batchloader(
                async msgs => {
                    const data = this.prepareData(msgs)
                    const result = await this.request(data)
                    return msgs.map(msg => ({
                        msg,
                        result,
                    }))
                },
                {
                    batchTime: +this.options.bulkTime,
                    maxSize: +this.options.bulkSize,
                    cacheTime: 0,
                    getKey: msg => msg,
                },
            )
        }
    }

    get needleOptions() {
        const {
            open_timeout,
            response_timeout,
            read_timeout,
            username,
            password,
            headers,
        } = this.options

        return {
            open_timeout,
            response_timeout,
            read_timeout,
            username,
            password,
            headers,
            json: true,
            user_agent: `${pckg.name}@${pckg.version}`,
        }
    }

    /**
     * @param {import("../Message")} msg
     * @returns {Object}
     */
    prepareMessage(msg) {
        const { message, details, meta } = msg
        return { message, details, meta }
    }

    /**
     * @param {Object|Array} data
     * @returns {Object|Array}
     */
    prepareData(data) {
        return data
    }

    async request(data) {
        const { uri, method } = this.options

        const { statusCode, body } = await needle(method, uri, data, this.needleOptions)

        if (statusCode !== 200) throw new HttpError(statusCode, body)

        return body
    }

    /**
     *
     * @param {import("../Message")} msg
     */
    log(msg) {
        const data = this.prepareMessage(msg)
        if (this.options.bulk) return this.loader.load(data)
        return this.request(data)
    }
}

module.exports = HttpTransport

/**
 * @callback prepareMessage
 * @param {import("../Message")} msg
 * @returns {Object}
 */

/**
 * @callback prepareData
 * @param {Object} data
 * @returns {Object}
 */

/**
 * @typedef {Object} HttpTransportConfig
 * @property {String} uri
 * @property {String} [method="POST"] POST
 * @property {Boolean} [bulk=false] false
 * @property {Number} [bulkSize=10] 10
 * @property {Number} [bulkTime=50]
 * @property {Number} [open_timeout=10000] (or timeout) Returns error if connection takes longer than X milisecs to establish. Defaults to 10000 (10 secs). 0 means no timeout
 * @property {Number} [response_timeout=20000] Returns error if no response headers are received in X milisecs, counting from when the connection is opened. Defaults to 0 (no response timeout).
 * @property {Number} [read_timeout=10000] Returns error if data transfer takes longer than X milisecs, once response headers are received. Defaults to 0 (no timeout)
 * @property {Object} [headers]
 * @property {Boolean} [compressed=true]
 * @property {String} [username] For HTTP basic auth.
 * @property {String} [password] For HTTP basic auth. Requires username to be passed, but is optional.
 * @property {prepareMessage} [prepareMessage]
 * @property {prepareData} [prepareData]
 */
