const merge = require('merge')
const moment = require('moment')
const fsExtra = require('fs-extra')
const path = require('path')
const fs = require('fs')
const { waitEmitter, sleep } = require('helpers-promise')
const util = require('util')

const StreamTransport = require('./StreamTransport')
const ArgumentsError = require('../utils/ArgumentsError')
const waitWriteStream = require('../utils/waitWriteStream')

class FileTransport extends StreamTransport {
    /**
     *
     * @param {Object} options
     * @param {String} [options.filename] required if no dirname is specified
     * @param {String} [options.dirname] required if no filename is specified
     * @param {"minute"|"hour"|"day"} [options.newFilePeriod=hour]
     * @param {String} [options.ext=".jsonl"]
     * @param {String} [options.separator="\n"]
     * @param {String} [options.filenamePrefix=nlogs]
     * @param {Number} [options.openFileTimeout=3000]
     */
    constructor(options) {
        super(options)
        this.options = merge(
            true,
            this.options,
            {
                newFilePeriod: 'hour',
                ext: '.jsonl',
                filenamePrefix: 'nlogs',
                openFileTimeout: 3000,
            },
            options,
        )

        if (!this.options.filename && !this.options.dirname)
            throw new ArgumentsError(ArgumentsError.TYPES.REQUIRED, 'filename')

        this.processOpen = false
        this.processReopen = false
        this.filename = null
        this.dirname = this.options.dirname || path.dirname(this.options.filename)
        this.fileStream = null
        this.nextReopen = 1

        this.errorHandler = this.errorHandler.bind(this)
    }

    errorHandler(err) {
        console.error(err.message)
    }

    async ensureDir() {
        await fsExtra.ensureDir(this.dirname)
    }

    async closeFile() {
        if (!this.fileStream) return
        this.unpipe(this.fileStream)
        const { fileStream } = this
        this.fileStream = null
        await waitWriteStream(fileStream)
        fileStream.removeListener('error', this.errorHandler)
        await util.promisify(fileStream.close)
    }

    async openFile() {
        if (this.processOpen) return
        this.processOpen = true
        try {
            await this.ensureDir()

            const { filename, nextReopen } = this.createCurrentFilename()
            this.filename = filename
            this.fileStream = fs.createWriteStream(this.filename, { flags: 'a' })
            this.pipe(this.fileStream)

            await waitEmitter(this.fileStream, 'open', 'error', this.options.openFileTimeout)
            this.nextReopen = nextReopen
            this.fileStream.on('error', this.errorHandler)
        } finally {
            this.processOpen = false
        }
    }

    async checkFile() {
        if (
            this.processOpen ||
            this.processReopen ||
            (this.fileStream && this.nextReopen > Date.now())
        )
            return

        this.processReopen = true

        await this.closeFile()

        let i = 0
        while (true) {
            i++

            try {
                await this.openFile()
                break
            } catch (e) {
                console.error(e.message)
            }

            await this.closeFile()
            await sleep(i * 1000)
        }

        this.processReopen = false
    }

    createCurrentFilename() {
        const currentTime = moment()
        const nextTime = currentTime.clone()

        let format = `D-M-YYYY`

        switch (this.options.newFilePeriod) {
            case 'day':
                nextTime.add(1, 'd')
                break
            case 'hour':
                nextTime.add(1, 'h')
                nextTime.startOf('hour')
                format += '_HH'
                break
            case 'minute':
                nextTime.add(1, 'm')
                nextTime.startOf('minute')
                format += '-mm'
                break
        }

        const filename = `${this.options.filenamePrefix}_${currentTime.format(format)}${
            this.options.ext
        }`

        return {
            nextReopen: +nextTime,
            filename: path.join(this.dirname, filename),
        }
    }

    log(msg) {
        this.checkFile().catch(e => {
            console.error(e.message)
            setTimeout(() => process.exit(1), 2000)
        })

        return super.log(msg)
    }
}

module.exports = FileTransport
