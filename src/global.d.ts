/* eslint-disable @typescript-eslint/no-unused-vars */
namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production'
    NODE_DEBUG?: string
    LOGGER_DEBUG?: string
    NLOGS_DEBUG?: string
    DEBUG?: string
    NLOGS_PROJECT?: string
    LOGGER_PROJECT?: string
    PROJECT?: string
    NLOGS_SERVICE?: string
    LOGGER_SERVICE?: string
    HOME?: string
    SERVICE?: string
    npm_package_name?: string
    npm_package_version?: string
  }
}
