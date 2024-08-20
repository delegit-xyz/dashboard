import type { config } from './walletConfigs'
import type { InferChains } from '@reactive-dot/core'

declare module '@reactive-dot/core' {
  export interface Chains extends InferChains<typeof config> {}
}
