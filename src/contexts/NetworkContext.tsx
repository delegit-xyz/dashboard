/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { dot, ksm } from '@polkadot-api/descriptors'
import { PolkadotClient, TypedApi, createClient } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider/web'

type NetworkContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

// const polakdotEndpoints = ['wss://rpc.ibp.network/polkadot']
// const kusamaEndpoints = ['wss://rpc.ibp.network/kusama']

export type NetworkProps = 'polkadot' | 'kusama'

export interface INetworkContext {
  network: NetworkProps
  setNetwork: React.Dispatch<React.SetStateAction<NetworkProps>>
  client: PolkadotClient | undefined
  api: TypedApi<typeof dot | typeof ksm> | undefined
}

const NetworkContext = createContext<INetworkContext | undefined>(undefined)

const NetworkContextProvider = ({ children }: NetworkContextProps) => {
  const [client, setClient] = useState<PolkadotClient>()
  const [api, setApi] = useState<TypedApi<typeof dot | typeof ksm>>()
  const [network, setNetwork] = useState<NetworkProps>('polkadot')

  useEffect(() => {
    let cl: PolkadotClient
    let typedApi: TypedApi<typeof dot | typeof ksm>
    if (network === 'polkadot') {
      cl = createClient(getWsProvider('wss://rpc.ibp.network/polkadot'))
      typedApi = cl.getTypedApi(dot)
    } else {
      cl = createClient(getWsProvider('wss://rpc.ibp.network/kusama'))
      typedApi = cl.getTypedApi(ksm)
    }
    setClient(cl)
    setApi(typedApi)
  }, [network])

  return (
    <NetworkContext.Provider value={{ network, setNetwork, client, api }}>
      {children}
    </NetworkContext.Provider>
  )
}

const useNetwork = () => {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkContextProvider')
  }
  return context
}

export { NetworkContextProvider, useNetwork }
