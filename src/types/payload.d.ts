import { InitOptions as PayloadInitOptions } from 'payload/types'
import { Config } from 'payload/config'

interface ExtendedInitOptions extends PayloadInitOptions {
  secret: string
  local: boolean
  config: Config
}

export type { ExtendedInitOptions }