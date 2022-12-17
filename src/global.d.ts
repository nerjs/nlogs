/* eslint-disable @typescript-eslint/no-unused-vars */
namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production'
    NODE_DEBUG?: string
    NLOGS_CONSISTENCY_CHECK?: string
    HOME?: string
    npm_package_version?: string
    npm_package_name?: string
  }
}
