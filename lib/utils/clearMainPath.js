const getMainPath = require('./getMainPath')

const RGX = new RegExp(`(${getMainPath()}|(.*)\/node_modules\/)`)

/**
 *
 * @param {String} pathname
 * @returns {String}
 */
module.exports = pathname => `${pathname}`.replace(RGX, '')
