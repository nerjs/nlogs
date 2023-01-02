import { Meta } from '../message/meta'
import { Parser, ParserOptions } from '../utils/parser'
import { Mod } from './mod'

export const appModule = new Mod('app', 'appModuleName', '1.2.3', '/path/to/app')
export const depModule = new Mod('module', 'depModuleName', '1.2.3', '/path/to/dependencies')
export const defaultMeta = new Meta('projectName', 'serviceName', 'categoryName', 'level', 'traceId', new Date())
export const parserOptions: ParserOptions = {
  canSingleErrorInDetails: true,
  canSingleTimeInDetails: true,
  canSingleTraceInDetails: true,
}
export const testParser = new Parser(parserOptions, defaultMeta)
