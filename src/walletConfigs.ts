import { dot, ksm } from '@polkadot-api/descriptors'
import type { Config } from '@reactive-dot/core'
import { InjectedWalletAggregator } from '@reactive-dot/core/wallets.js'
import { getWsProvider } from 'polkadot-api/ws-provider/web'
import { registerDotConnect } from 'dot-connect'
import { SupportedWalletOrAggregator } from 'node_modules/dot-connect/build/types'

const config: Config = {
  chains: {
    polkadot: {
      descriptor: dot,
      provider: getWsProvider('wss://rpc.ibp.network/polkadot'),
    },
    kusama: {
      descriptor: ksm,
      provider: getWsProvider('wss://rpc.ibp.network/kusama'),
    },
  },
  wallets: [new InjectedWalletAggregator()],
}

// Register dot-connect custom elements & configure supported wallets
registerDotConnect({
  wallets: config.wallets as SupportedWalletOrAggregator[],
})

export default config
