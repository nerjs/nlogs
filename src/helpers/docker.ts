import { readFileSync } from 'fs'
import { existsDir, existsFile } from './file'

const ENV = '/.dockerenv'
const PROC = '/proc/self/cgroup'
const SECRETS = 'run/secrets'

export const hasDockerEnv = () => existsFile(ENV)
export const hasProc = () => existsFile(PROC) && readFileSync(PROC, 'utf-8').includes('docker')
export const existsSecrets = () => existsDir(SECRETS)

export const inDocker = () => hasDockerEnv() || hasProc() || existsSecrets()
