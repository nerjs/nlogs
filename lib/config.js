const merge = require('merge')
const findPackage = require('find-package')
const path = require('path')
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

        Object.keys(this.config.methods).forEach(key => {
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

        this.formatter = this.config.formatter
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
