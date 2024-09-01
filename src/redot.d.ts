import type { config } from './walletConfigs'
import type { InferChains } from '@reactive-dot/core'

declare module '@reactive-dot/core' {
  export type Chains = InferChains<typeof config>
}
