require('colors')
const CommonConsoleTransport = require('./CommonConsoleTransport')

class ConsoleTransport extends CommonConsoleTransport {
    /**
     * @param {String|Number} str
     * @param {String} styleName
     * @returns {String|String[]}
     */
    style(str, styleName) {
        if (!ConsoleTransport.styles[styleName]) console.log(styleName.red)
        return ConsoleTransport.styles[styleName]
            ? this.reduceStyle(str, ConsoleTransport.styles[styleName])
            : str
    }

    reduceStyle(str, st) {
        return st.reduce((acc, cur) => acc[cur] || acc, str)
    }

    static get styles() {
        return {
            time: ['white', 'bgBlack'],
            firstSegment: ['yellow', 'italic', 'dim'],
            segment: ['gray', 'italic'],
            lastSegment: ['cyan', 'italic'],
            log: ['green'],
            info: ['brightGreen'],
            debug: ['magenta'],
            warn: ['yellow'],
            error: ['brightRed'],
            fatal: ['red'],
            count: ['brightYellow'],
            metaName: ['green'],
            metaValue: ['yellow', 'italic'],
            timeLog: ['brightYellow'],
            timeEnd: ['brightYellow'],
            dir: ['brightMagenta'],
            table: ['brightMagenta'],
        }
    }
}

module.exports = ConsoleTransport
