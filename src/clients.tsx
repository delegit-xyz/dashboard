// `dot` is the name we gave to `npx papi add`
import { dot, ksm } from '@polkadot-api/descriptors'
import { TypedApi, createClient } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider/web'

// Connect to the polkadot relay chain.
export const dotClient = createClient(
  getWsProvider('wss://dot-rpc.stakeworld.io'),
)
export const ksmClient = createClient(
  getWsProvider('wss://rpc.ibp.network/kusama'),
)

// To interact with the chain, you need to get the `TypedApi`, which includes
// all the types for every call in that chain:
export const dotApi: TypedApi<typeof dot> = dotClient.getTypedApi(dot)
export const kusamaApi: TypedApi<typeof ksm> = ksmClient.getTypedApi(ksm)
