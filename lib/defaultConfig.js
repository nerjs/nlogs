const stringFormatter = require('./stringFormatter')
const timeFormatter = require('./timeFormatter')
const { GROUP_TIME } = require('./constants')

module.exports = {
    time: ['gray', 'bgBlack'],
    label: ['white', 'bold'],
    segments: {
        first: ['yellow', 'italic', 'dim'],
        last: ['cyan', 'italic'],
        all: ['grey', 'dim'],
        delimiter: ['gray'],
    },
    formatter: {
        string: stringFormatter,
        time: timeFormatter,
    },
    groupedEveryTime: GROUP_TIME.HOUR, // minute, hour, day, null
    methods: {
        log: {
            show: true,
        },
        info: {
            show: true,
            label: ['green'],
        },
        debug: {
            label: ['magenta'],
            show: process.env.NODE_ENV != 'production',
        },
        warn: {
            show: process.env.NODE_ENV != 'production',
            label: ['yellow'],
        },
        error: {
            label: ['red'],
            show: true,
        },
        time: {
            show: true,
            showStartTimer: false,
            warningMissingLabel: true,
            warningPresentLabel: true,
            changePresentLabel: false,
            diffTimeColor: ['yellow'],
            label: ['black', 'bgYellow'],
        },
        dir: {
            show: process.env.NODE_ENV != 'production',
            depth: 3,
        },
        table: {
            show: process.env.NODE_ENV != 'production',
        },
    },
}
