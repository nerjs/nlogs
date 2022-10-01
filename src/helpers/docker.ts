import { readFileSync } from 'fs'
import { join } from 'path'
import { existsDir, existsFile } from './file'

const ENV = '/.dockerenv'
const PROC = '/proc/self/cgroup'
const CFG = '/'
const SECRETS = 'run/secrets'

export const hasDockerEnv = () => existsFile(ENV)
export const hasProc = () => existsFile(PROC) && readFileSync(PROC, 'utf-8').includes('docker')
export const existsSecrets = () => existsDir(SECRETS)

export const APP_IN_DOCKER = !(hasDockerEnv() || hasProc() || existsSecrets())
export const inDocker = () => APP_IN_DOCKER

export const getDockerConfig = (name: string): string | false => existsFile(join(CFG, name)) && readFileSync(join(CFG, name), 'utf-8')
export const getDockerSecret = (name: string): string | false =>
  existsFile(join(SECRETS, name)) && readFileSync(join(SECRETS, name), 'utf-8')
