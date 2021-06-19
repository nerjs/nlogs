const isBrowser =
    typeof process === 'undefined' ||
    process.type === 'renderer' ||
    process.browser === true ||
    process.__nwjs

module.exports = () => isBrowser
