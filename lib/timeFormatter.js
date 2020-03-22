const moment = require('moment')

module.exports = (time, short) => moment(time).format(short ? '..HH:mm:ss' : 'D/M/YYYY HH:mm:ss')
