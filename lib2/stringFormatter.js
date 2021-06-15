const colors = require('colors')

module.exports = (str, styles = []) =>
    styles.reduce((prevstr, style) => colors[style](prevstr), str)
