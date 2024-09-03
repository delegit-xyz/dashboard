import { dot } from '@polkadot-api/descriptors'
import { getWsProvider } from 'polkadot-api/ws-provider/web'

export const config = {
  chains: {
    polkadot: {
      descriptor: dot,
      provider: getWsProvider('wss://dot-rpc.stakeworld.io'),
    },
  },
}
