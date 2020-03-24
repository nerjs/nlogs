const merge = require('merge')
const findPackage = require('find-package')
const path = require('path')
const { fileURLToPath } = require('url')
const defaultConfig = require('./defaultConfig')

class NLoggerConfig {
    constructor(mod, innerConfig) {
        this.module = mod
        this.config = innerConfig || {}
        this.filename = null
        this.packagePath = null
        this.packageName = null
        this.segments = []

        this.initConfig()
        this.initFileInfo()
    }

    initConfig() {
        this.config = merge.recursive({}, NLoggerConfig.config, this.config || {})

        let maxWidth = 0

        Object.keys(this.config.methods).forEach(key => {
            if (key.length > maxWidth) maxWidth = key.length
            this.config.methods[key] = merge.recursive(
                {},
                {
                    time: this.config.time,
                    segments: this.config.segments,
                    label: this.config.label,
                },
                this.config.methods[key],
            )
        })

        Object.keys(this.config.methods).forEach(key => {
            this.config.methods[key].__space = Array(maxWidth - key.length)
                .fill(null)
                .map(() => ' ')
                .join('')
        })

        this.formatters = this.config.formatters

        if (typeof this.module === 'string') {
            const filename = this.module
            this.module = {
                filename,
                path: path.dirname(filename),
            }
        } else if (typeof this.module === 'object' && !this.module.filename && this.module.url) {
            const filename = fileURLToPath(this.module.url)
            this.module = {
                filename,
                path: path.dirname(filename),
            }
        }
    }

    initFileInfo() {
        this.filename = this.module.filename

        const packageInfo = findPackage(this.module.path, true)

        if (!packageInfo) return

        this.packageName = packageInfo.name
        this.packagePath = path.dirname(packageInfo.paths.absolute)

        this.segments = this.filename
            .replace(this.packagePath, '')
            .replace(/^\//, '')
            .split(path.sep)

        this.segments.unshift(this.packageName)
    }

    static config = defaultConfig

    static setConfig(newConfig) {
        this.config = merge.recursive({}, this.config, newConfig)
    }
}

module.exports = NLoggerConfig
