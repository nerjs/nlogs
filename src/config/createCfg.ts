import { parse } from 'dotenv'
import { APP_IN_DOCKER, getDockerConfig, getDockerSecret } from '../helpers/docker'
import { DOCKER_CONFIG_NAME, SECRETS } from './constants'

const cfg: Record<string, any> = {}
const ENV = process.env.NODE_ENV || 'development'

if (APP_IN_DOCKER) {
  const dcfg = getDockerConfig(DOCKER_CONFIG_NAME)
  if (dcfg) Object.assign(cfg, parse(dcfg))
}

const envConfig = { ...process.env }
Object.keys(process.env)
  .filter(key => !['INDEX', 'FILE'].includes(key))
  .forEach(key => {
    const matched = key.match(/^(?<type>(LOGGER|NLOGS))_(?<key>.*)$/)
    if (!matched) return
    if (matched.groups.type === 'NLOGS') {
      envConfig[matched.groups.key] = process.env[key]
    } else if (matched.groups.type === 'LOGGER' && !process.env[`NLOGS_${matched.groups.key}`]) {
      envConfig[matched.groups.key] = process.env[key]
    } else {
      envConfig[key] = process.env[key]
    }
  })

Object.assign(cfg, envConfig)

if (APP_IN_DOCKER) {
  for (const key in SECRETS) {
    const secret = getDockerSecret(SECRETS[key])
    if (secret) cfg[key] = secret
  }
}

export { cfg, ENV }
