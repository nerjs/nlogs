class ArgumentsError extends Error {
    /**
     *
     * @param {String} type
     * @param {String} path
     * @param {*} [expect]
     * @param {*} [current]
     */
    constructor(type, path, expect, current) {
        switch (type) {
            case ArgumentsError.TYPES.REQUIRED:
                super(`Missing required argument ${path}`)
                break
            case ArgumentsError.TYPES.INCORRECT:
                super(`Incorrect argument ${path}`)
                break
            case ArgumentsError.TYPES.INCORRECT_TYPE:
                super(`Incorrect type of argument ${path}`)
                break
        }
        this.type = type
        this.path = path
        if (expect !== undefined) {
            this.expect = expect
            this.current = current
        }
        this.name = 'ArgumentsError'
    }

    static TYPES = {
        REQUIRED: 'required',
        INCORRECT: 'incorrect',
        INCORRECT_TYPE: 'incorrect_type',
    }
}

module.exports = ArgumentsError
