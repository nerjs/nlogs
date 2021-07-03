const Message = require('./Message')

/**
 * @class
 * @name ErrorMessage
 */
class ErrorMessage extends Message {
    /**
     *
     * @param {Error} err
     * @param {import("./Message")} msg
     * @param {String} transportName
     */
    constructor(err, msg, transportName) {
        const data = [
            'TransportError:',
            err,
            {
                transport: transportName,
                msg: {
                    message: msg.message,
                    details: msg.details,
                    meta: msg.meta,
                },
            },
        ]

        super(msg.context.clone(), 'error', data)

        this.failedErrorTransports = []
    }

    addFailedErrorTransport(transportName) {
        this.failedErrorTransports.push(transportName)
    }

    get details() {
        const det = super.details
        if (this.failedErrorTransports.length)
            det.failedErrorTransports = this.failedErrorTransports
        return det
    }
}

module.exports = ErrorMessage
