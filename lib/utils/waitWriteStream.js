module.exports = stream =>
    new Promise((resolve, reject) => {
        const handle = obj => {
            if (!obj) return resolve()
            const { callback, next } = obj
            obj.callback = err => {
                // TODO: предположение что ошибка будет передана
                if (err) {
                    err.qq = 2
                    reject(err)
                    return (callback || (() => {}))(err)
                }

                handle(next)
            }
        }

        if (stream && stream._writableState) {
            handle(stream._writableState.bufferedRequest)
        } else {
            reject(new Error('Incorrect or unknown stream object'))
        }
    })
