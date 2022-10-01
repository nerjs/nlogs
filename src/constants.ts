export const DEFAULT_PROJECT = 'main'
export const DEFAULT_SERVICE = 'root'

export const CURRENT_PROJECT = process.env.NLOGS_PROJECT || process.env.LOGGER_PROJECT || process.env.PROJECT || DEFAULT_PROJECT
export const CURRENT_SERVICE = process.env.NLOGS_SERVICE || process.env.LOGGER_SERVICE || process.env.SERVICE

export const FILES = process.env.NLOGS_FILES || process.env.LOGGER_FILES || process.env.FILES
export const FILES_DIRECTORY = process.env.NLOGS_FILES_DIRECTORY || process.env.LOGGER_FILES_DIRECTORY || process.env.FILES_DIRECTORY
export const FILES_SIZE = process.env.NLOGS_FILES_SIZE || process.env.LOGGER_FILES_SIZE || process.env.FILES_SIZE || '100M'
export const FILES_MAX_SIZE = process.env.NLOGS_FILES_MAX_SIZE || process.env.LOGGER_FILES_MAX_SIZE || process.env.FILES_MAX_SIZE || '1G'
export const FILES_MAX_FILES =
  +(process.env.NLOGS_FILES_MAX_FILES || process.env.LOGGER_FILES_MAX_FILES || process.env.FILES_MAX_FILES) || 10
