/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { dot, fastWestend, ksm, westend } from '@polkadot-api/descriptors'
import {
  ChainDefinition,
  PolkadotClient,
  TypedApi,
  createClient,
} from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider/web'

import { getSmProvider } from 'polkadot-api/sm-provider'
import SmWorker from 'polkadot-api/smoldot/worker?worker'
import { startFromWorker } from 'polkadot-api/smoldot/from-worker'
import { getChainInformation } from '@/lib/utils'
import { AssetType } from '@/lib/types'
import networks from '@/assets/networks.json'

type NetworkContextProps = {
  children: React.ReactNode | React.ReactNode[]
}
export type NetworksFromConfig = keyof typeof networks
export type SupportedNetworkNames =
  | 'polkadot-lc'
  | 'kusama-lc'
  | NetworksFromConfig
export type ApiType = TypedApi<typeof dot | typeof ksm>

export const descriptorName: Record<SupportedNetworkNames, ChainDefinition> = {
  polkadot: dot,
  'polkadot-lc': dot,
  kusama: ksm,
  'kusama-lc': ksm,
  westend: westend,
  'fast-westend': fastWestend,
}

export interface INetworkContext {
  lightClientLoaded: boolean
  isLight: boolean
  setNetwork: React.Dispatch<React.SetStateAction<SupportedNetworkNames>>
  client: PolkadotClient | undefined
  api: TypedApi<typeof dot | typeof ksm> | undefined
  network: SupportedNetworkNames
  assetInfo: AssetType
}

const NetworkContext = createContext<INetworkContext | undefined>(undefined)

const NetworkContextProvider = ({ children }: NetworkContextProps) => {
  const [lightClientLoaded, setLightClientLoaded] = useState<boolean>(false)
  const [isLight, setIsLight] = useState<boolean>(false)
  const [client, setClient] = useState<PolkadotClient>()
  const [api, setApi] = useState<ApiType>()

  const [assetInfo, setAssetInfo] = useState<AssetType>({} as AssetType)
  const [network, setNetwork] = useState<SupportedNetworkNames>('polkadot')

  useEffect(() => {
    let client: PolkadotClient

    if (network === 'polkadot-lc' || network === 'kusama-lc') {
      const relay = network === 'polkadot-lc' ? 'polkadot' : 'kusama'

      const { assetInfo } = getChainInformation(relay)
      setAssetInfo(assetInfo)
      setIsLight(true)
      const smoldot = startFromWorker(new SmWorker())
      let relayChain: Promise<unknown>
      if (relay === 'polkadot') {
        relayChain = import('polkadot-api/chains/polkadot').then(
          ({ chainSpec }) => smoldot.addChain({ chainSpec }),
        )
      } else {
        relayChain = import('polkadot-api/chains/ksmcc3').then(
          ({ chainSpec }) => smoldot.addChain({ chainSpec }),
        )
      }
      //@ts-expect-error the Chain type isn't exported
      //it comes from 'smoldot' that we don't import
      client = createClient(getSmProvider(relayChain as unknown))
    } else {
      const { assetInfo, wsEndpoint } = getChainInformation(network)
      setAssetInfo(assetInfo)
      setIsLight(false)

      client = createClient(getWsProvider(wsEndpoint))
    }

    const descriptor = descriptorName[network]
    const typedApi = client.getTypedApi(descriptor)

    setClient(client)
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
