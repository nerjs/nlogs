class StreamError extends Error {
    constructor(tag, err) {
        const message = `[${tag}] ${err instanceof Error ? err.message : err || ''}`
        super(message)
        this.tag = tag
        this.error = err

        this.name = 'StreamError'
    }
}

module.exports = StreamError
