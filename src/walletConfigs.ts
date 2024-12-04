import type { Config } from '@reactive-dot/core'
import { InjectedWalletProvider } from '@reactive-dot/core/wallets.js'
import { WalletConnect } from '@reactive-dot/wallet-walletconnect'
import { registerDotConnect } from 'dot-connect'

export const config = {
  chains: {},
  wallets: [
    new InjectedWalletProvider(),
    new WalletConnect({
      projectId: 'f7a61cf7fe70a61e728f1dd5d53e9cea',
      providerOptions: {
        metadata: {
          name: 'Delegit',
          description: 'Polkadot delegation made easy',
          url: 'https://delegit.xyz',
          icons: [''],
        },
      },
      chainIds: [
        // https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-13.md
        'polkadot:91b171bb158e2d3848fa23a9f1c25182', // Polkadot
        'polkadot:b0a8d493285c2df73290dfb7e61f870f', // Kusama
        'polkadot:e143f23803ac50e8f6f8e62695d1ce9e', // Westend
      ],
    }),
  ],
} satisfies Config

// Register dot-connect custom elements & configure supported wallets
registerDotConnect({
  wallets: config.wallets,
})
