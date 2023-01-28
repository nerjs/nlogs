/* eslint-disable @typescript-eslint/no-unused-vars */
namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production'
    NODE_DEBUG?: string
    NLOGS_CONSISTENCY_CHECK?: string

    NLOGS_PROJECT?: string
    LOGGER_PROJECT?: string
    PROJECT?: string

    NLOGS_SERVICE?: string
    LOGGER_SERVICE?: string
    SERVICE?: string

    NLOGS_CATEGORY?: string
    LOGGER_CATEGORY?: string
    SHOW_CATEGORY?: string
    ALLOWED_CATEGORY?: string
    CATEGORY?: string

    NLOGS_CATEGORIES?: string
    LOGGER_CATEGORIES?: string
    SHOW_CATEGORIES?: string
    ALLOWED_CATEGORIES?: string
    CATEGORIES?: string

    NLOGS_DEBUG?: string
    LOGGER_DEBUG?: string
    NODE_DEBUG?: string
    DEBUG?: string

    NLOGS_FORMATTER?: 'json' | 'light' | 'dark' | 'string'

    NLOGS_DEBUG_LEVELS?: string
    DEBUG_LEVELS?: string

    NLOGS_MODULE_DEBUG_LEVELS?: string
    MODULE_DEBUG_LEVELS?: string

    NLOGS_LEVELS?: string
    LOGGER_LEVELS?: string
    LEVELS?: string

    NLOGS_LEVEL?: string
    LOGGER_LEVEL?: string
    LEVEL?: string

    NLOGS_STRICT_LEVEL_RULES?: string
    LOGGER_STRICT_LEVEL_RULES?: string

    LOGGER_DEFAULT_INDEX?: string

    TASK_SLOT?: string
    SLOT?: string
    INSTANCE_ID?: string

    HOME?: string
    npm_package_version?: string
    npm_package_name?: string
  }
}
