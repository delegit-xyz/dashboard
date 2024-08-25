/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { dot, ksm } from '@polkadot-api/descriptors'
import { PolkadotClient, TypedApi, createClient } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider/web'

import { getSmProvider } from 'polkadot-api/sm-provider'
import SmWorker from 'polkadot-api/smoldot/worker?worker'
import { startFromWorker } from 'polkadot-api/smoldot/from-worker'

type NetworkContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

// const polakdotEndpoints = ['wss://rpc.ibp.network/polkadot']
// const kusamaEndpoints = ['wss://rpc.ibp.network/kusama']

export type NetworkProps = 'polkadot' | 'kusama' | 'polkadot-lc' | 'kusama-lc'
export type ApiType = TypedApi<typeof dot | typeof ksm>
export type NetworkInfo = {
  symbol: 'DOT' | 'KSM'
  chainDecimals: number
}

export interface INetworkContext {
  lightClientLoaded: boolean
  isLight: boolean
  setNetwork: React.Dispatch<React.SetStateAction<NetworkProps>>
  client: PolkadotClient | undefined
  api: TypedApi<typeof dot | typeof ksm> | undefined
  network: NetworkProps
  chainInfo: NetworkInfo
}

const NetworkContext = createContext<INetworkContext | undefined>(undefined)

const NetworkContextProvider = ({ children }: NetworkContextProps) => {
  const [lightClientLoaded, setLightClientLoaded] = useState<boolean>(false)
  const [isLight, setIsLight] = useState<boolean>(false)
  const [client, setClient] = useState<PolkadotClient>()
  const [api, setApi] = useState<ApiType>()
  const [chainInfo, setChainInfo] = useState<NetworkInfo>({
    symbol: 'DOT',
    chainDecimals: 10,
  })
  const [network, setNetwork] = useState<NetworkProps>('polkadot')

  useEffect(() => {
    let cl: PolkadotClient
    let typedApi: ApiType
    let info: NetworkInfo
    switch (network) {
      case 'kusama':
        setIsLight(false)
        cl = createClient(getWsProvider('wss://rpc.ibp.network/kusama'))
        typedApi = cl.getTypedApi(ksm)
        info = {
          symbol: 'KSM',
          chainDecimals: 12,
        }
        break
      case 'polkadot-lc': {
        setIsLight(true)
        const smoldot = startFromWorker(new SmWorker())
        const dotRelayChain = import('polkadot-api/chains/polkadot').then(
          ({ chainSpec }) => smoldot.addChain({ chainSpec }),
        )
        cl = createClient(getSmProvider(dotRelayChain))
        typedApi = cl.getTypedApi(dot)
        info = {
          symbol: 'DOT',
          chainDecimals: 10,
        }
        break
      }
      case 'kusama-lc': {
        setIsLight(true)
        const smoldot = startFromWorker(new SmWorker())
        const ksmRelayChain = import('polkadot-api/chains/ksmcc3').then(
          ({ chainSpec }) => smoldot.addChain({ chainSpec }),
        )
        cl = createClient(getSmProvider(ksmRelayChain))
        typedApi = cl.getTypedApi(ksm)
        info = {
          symbol: 'KSM',
          chainDecimals: 12,
        }
        break
      }
      default:
        setIsLight(false)
        cl = createClient(getWsProvider('wss://rpc.ibp.network/polkadot'))
        typedApi = cl.getTypedApi(dot)
        info = {
          symbol: 'DOT',
          chainDecimals: 10,
        }
    }
    setClient(cl)
    setApi(typedApi)
    setChainInfo(info)
  }, [network])

  useEffect(() => {
    isLight &&
      client?.finalizedBlock$.subscribe((finalizedBlock) => {
        if (finalizedBlock.number && !lightClientLoaded) {
          setLightClientLoaded(true)
        }
      })
  }, [client?.finalizedBlock$, isLight, lightClientLoaded])

  return (
    <NetworkContext.Provider
      value={{
        lightClientLoaded,
        isLight,
        network,
        setNetwork,
        client,
        api,
        chainInfo,
      }}
    >
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
