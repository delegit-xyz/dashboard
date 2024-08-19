import { dot } from '@polkadot-api/descriptors'
import type { Config } from '@reactive-dot/core'
import { InjectedWalletAggregator } from '@reactive-dot/core/wallets.js'
import { getWsProvider } from 'polkadot-api/ws-provider/web'
import { registerDotConnect } from 'dot-connect'
import { SupportedWalletOrAggregator } from 'node_modules/dot-connect/build/types'

export const config: Config = {
  chains: {
    polkadot: {
      descriptor: dot,
      provider: getWsProvider('wss://dot-rpc.stakeworld.io'),
    },
  },
  wallets: [new InjectedWalletAggregator()],
}

// Register dot-connect custom elements & configure supported wallets
registerDotConnect({
  wallets: config.wallets as SupportedWalletOrAggregator[],
})
