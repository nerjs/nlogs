const { STATUS_CODES } = require('http')

class HttpError extends Error {
    /**
     * @param {Numer} statusCode
     * @param {String|Object} bodyResponse
     */
    constructor(statusCode, bodyResponse) {
        const message =
            typeof bodyResponse === 'string'
                ? bodyResponse
                : typeof bodyResponse === 'object' && bodyResponse.message
                ? bodyResponse.message
                : STATUS_CODES[statusCode]

        super(message)
        this.statusCode = statusCode
        this.bodyResponse = bodyResponse
    }
}

module.exports = HttpError
