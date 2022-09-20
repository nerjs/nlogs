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
    FILES_DIRECTORY?: string
    NLOGS_FILES_DIRECTORY?: string
    LOGGER_FILES_DIRECTORY?: string
    FILES_MAX_SIZE?: string
    NLOGS_FILES_MAX_SIZE?: string
    LOGGER_FILES_MAX_SIZE?: string
    FILES?: 'user' | 'home' | 'project' | 'true' | 'false' | '0' | '1'
    NLOGS_FILES?: 'user' | 'home' | 'project' | 'true' | 'false' | '0' | '1'
    LOGGER_FILES?: 'user' | 'home' | 'project' | 'true' | 'false' | '0' | '1'
    FILES_SIZE?: string
    NLOGS_FILES_SIZE?: string
    LOGGER_FILES_SIZE?: string
    FILES_MAX_FILES?: string
    NLOGS_FILES_MAX_FILES?: string
    LOGGER_FILES_MAX_FILES?: string
  }
}
