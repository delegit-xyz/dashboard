/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { dot, ksm } from '@polkadot-api/descriptors'
import { PolkadotClient, TypedApi, createClient } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider/web'

import { getSmProvider } from 'polkadot-api/sm-provider'
import SmWorker from 'polkadot-api/smoldot/worker?worker'
import { startFromWorker } from 'polkadot-api/smoldot/from-worker'
import { supportedNetworksChainIds } from '@/lib/constants'
import { getChainInformation } from '@/lib/utils'
import { AssetType } from '@/lib/types'

type NetworkContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

export type NetworkProps = 'polkadot' | 'kusama' | 'polkadot-lc' | 'kusama-lc'
export type ApiType = TypedApi<typeof dot | typeof ksm>

export interface INetworkContext {
  lightClientLoaded: boolean
  isLight: boolean
  setNetwork: React.Dispatch<React.SetStateAction<NetworkProps>>
  client: PolkadotClient | undefined
  api: TypedApi<typeof dot | typeof ksm> | undefined
  network: NetworkProps
  assetInfo: AssetType
}

const NetworkContext = createContext<INetworkContext | undefined>(undefined)

const NetworkContextProvider = ({ children }: NetworkContextProps) => {
  const [lightClientLoaded, setLightClientLoaded] = useState<boolean>(false)
  const [isLight, setIsLight] = useState<boolean>(false)
  const [client, setClient] = useState<PolkadotClient>()
  const [api, setApi] = useState<ApiType>()

  const [assetInfo, setAssetInfo] = useState<AssetType>({} as AssetType)
  const [network, setNetwork] = useState<NetworkProps>('polkadot')

  useEffect(() => {
    let cl: PolkadotClient
    let typedApi: ApiType

    switch (network) {
      case 'polkadot':
        {
          const [wsProv, assetInformation] = getChainInformation('polkadot')
          setAssetInfo(assetInformation)
          setIsLight(false)
          if (!wsProv) return
          cl = createClient(getWsProvider('wss://rpc.ibp.network/polkadot'))
          typedApi = cl.getTypedApi(dot)
        }
        break
      case 'polkadot-lc': {
        const [, assetInformation] = getChainInformation(
          supportedNetworksChainIds.polkadot,
        )
        setAssetInfo(assetInformation)
        setIsLight(true)
        const smoldot = startFromWorker(new SmWorker())
        const dotRelayChain = import('polkadot-api/chains/polkadot').then(
          ({ chainSpec }) => smoldot.addChain({ chainSpec }),
        )
        cl = createClient(getSmProvider(dotRelayChain))
        typedApi = cl.getTypedApi(dot)
        break
      }
      case 'kusama':
        {
          const [wsProv, assetInformation] = getChainInformation(
            supportedNetworksChainIds.kusama,
          )
          setAssetInfo(assetInformation)
          setIsLight(false)
          if (!wsProv) return
          cl = createClient(getWsProvider(wsProv))
          typedApi = cl.getTypedApi(ksm)
        }
        break
      case 'kusama-lc': {
        const [, assetInformation] = getChainInformation(
          supportedNetworksChainIds.kusama,
        )
        setAssetInfo(assetInformation)
        setIsLight(true)
        const smoldot = startFromWorker(new SmWorker())
        const ksmRelayChain = import('polkadot-api/chains/ksmcc3').then(
          ({ chainSpec }) => smoldot.addChain({ chainSpec }),
        )
        cl = createClient(getSmProvider(ksmRelayChain))
        typedApi = cl.getTypedApi(ksm)
        break
      }
    }
    setClient(cl)
    setApi(typedApi)
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
        assetInfo,
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
