const merge = require('merge')
const moment = require('moment')
const fsExtra = require('fs-extra')
const path = require('path')
const fs = require('fs')

const StreamTransport = require('./StreamTransport')
const ArgumentsError = require('../utils/ArgumentsError')

class FileTransport extends StreamTransport {
    /**
     *
     * @param {FileTransportOptions} options
     */
    constructor(options) {
        const op = merge(
            true,
            {
                filePeriod: 'hour',
                ext: '.jsonl',
                filenamePrefix: 'nlogs',
                openFileTimeout: 3000,
            },
            options,
        )

        if (!op.filename && !op.dirname)
            throw new ArgumentsError(ArgumentsError.TYPES.REQUIRED, 'filename')

        super(
            merge(true, op, {
                restart: !op.filename && op.filePeriod,
                startEvent: 'open',
                stopEvent: 'close',
                startTimeout: op.openFileTimeout,
            }),
        )

        this.filename = null
        this.dirname = this.options.dirname || path.dirname(this.options.filename)
    }

    async ensureDir() {
        await fsExtra.ensureDir(this.dirname)
    }

    async createStream(op) {
        const filename = this.options.filename || this.createCurrentFilename()
        await this.ensureDir()
        return fs.createWriteStream(filename, op)
    }

    createCurrentFilename() {
        const currentTime = moment()

        let format = `D-M-YYYY`

        switch (this.options.filePeriod) {
            case 'day':
                currentTime.startOf('d')
                break
            case 'hour':
                currentTime.startOf('hour')
                format += '_HH'
                break
            case 'minute':
                currentTime.startOf('minute')
                format += '-mm'
                break
        }

        const filename = `${this.options.filenamePrefix}_${currentTime.format(format)}${
            this.options.ext
        }`

        return path.join(this.dirname, filename)
    }
}

module.exports = FileTransport

/**
 * @typedef {Object} OnlyFileTransportOptions
 * @property {String} [options.filename] required if no dirname is specified
 * @property {String} [options.dirname] required if no filename is specified
 * @property {"minute"|"hour"|"day"|false} [options.filePeriod=hour]
 * @property {String} [options.ext=".jsonl"]
 * @property {String} [options.filenamePrefix=nlogs]
 * @property {Number} [options.openFileTimeout=3000]
 */

/**
 * @typedef {import("./StreamTransport").StreamTransportOptions | OnlyFileTransportOptions} FileTransportOptions
 */
