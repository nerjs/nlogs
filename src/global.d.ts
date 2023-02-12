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

    NLOGS_DEFAULT_INDEX?: string
    LOGGER_DEFAULT_INDEX?: string

    NLOGS_ITEM_MAX_CACHE_TIME?: string
    NLOGS_TIME_MAX_CACHE_TIME?: string
    NLOGS_COUNT_MAX_CACHE_TIME?: string

    NLOGS_ITEM_CHECK_CACHE_TIMEOUT?: string
    NLOGS_TIME_CHECK_CACHE_TIMEOUT?: string
    NLOGS_COUNT_CHECK_CACHE_TIMEOUT?: string

    NLOGS_ITEM_MAX_CACHE_SIZE?: string
    NLOGS_TIME_MAX_CACHE_SIZE?: string
    NLOGS_COUNT_MAX_CACHE_SIZE?: string

    NLOGS_TIME_LOG_ON_START?: string

    TASK_SLOT?: string
    SLOT?: string
    INSTANCE_ID?: string

    HOME?: string
    npm_package_version?: string
    npm_package_name?: string
  }
}
