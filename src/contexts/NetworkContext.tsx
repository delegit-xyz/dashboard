/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { dot, fastWestend, ksm, westend } from '@polkadot-api/descriptors'
import {
  ChainDefinition,
  PolkadotClient,
  TypedApi,
  createClient,
} from 'polkadot-api'
import { Chain } from 'polkadot-api/smoldot'
import { getWsProvider } from 'polkadot-api/ws-provider/web'

import { getSmProvider } from 'polkadot-api/sm-provider'
import SmWorker from 'polkadot-api/smoldot/worker?worker'
import { startFromWorker } from 'polkadot-api/smoldot/from-worker'
import { getChainInformation } from '@/lib/utils'
import { AssetType } from '@/lib/types'
import networks from '@/assets/networks.json'
import { DEFAULT_NETWORK, SELECTED_NETWORK_KEY } from '@/lib/constants'
import { useLocalStorage } from 'usehooks-ts'
import { useSearchParams } from 'react-router-dom'

type NetworkContextProps = {
  children: React.ReactNode | React.ReactNode[]
}
export type NetworksFromConfig = keyof typeof networks
export type SupportedNetworkNames =
  | 'polkadot-lc'
  | 'porkydot'
  | 'kusama-lc'
  | 'kus000mba'
  | NetworksFromConfig
export type ApiType = TypedApi<typeof dot | typeof ksm>

export const descriptorName: Record<SupportedNetworkNames, ChainDefinition> = {
  porkydot: dot,
  polkadot: dot,
  'polkadot-lc': dot,
  kusama: ksm,
  kus000mba: ksm,
  'kusama-lc': ksm,
  westend: westend,
  'fast-westend': fastWestend,
}

export type TrackList = Record<number, string>

export interface INetworkContext {
  lightClientLoaded: boolean
  isLight: boolean
  selectNetwork: (network: string, shouldResetAccountAddress?: boolean) => void
  client: PolkadotClient | undefined
  api: TypedApi<typeof dot | typeof ksm> | undefined
  network?: SupportedNetworkNames
  assetInfo: AssetType
  trackList: TrackList
}

const isEasternEggNetwork = (network: string) =>
  network === 'porkydot'
    ? ('polkadot' as SupportedNetworkNames)
    : network === 'kus000mba'
      ? ('kusama' as SupportedNetworkNames)
      : (network as SupportedNetworkNames)

export const isSupportedNetwork = (
  network: string,
): network is SupportedNetworkNames =>
  !!descriptorName[network as SupportedNetworkNames]

const NetworkContext = createContext<INetworkContext | undefined>(undefined)

const NetworkContextProvider = ({ children }: NetworkContextProps) => {
  const [localStorageNetwork, setLocalStorageNetwork] = useLocalStorage(
    SELECTED_NETWORK_KEY,
    '',
  )

  const [lightClientLoaded, setLightClientLoaded] = useState<boolean>(false)
  const [isLight, setIsLight] = useState<boolean>(false)
  const [client, setClient] = useState<PolkadotClient>()
  const [api, setApi] = useState<ApiType>()
  const [trackList, setTrackList] = useState<TrackList>({})

  const [assetInfo, setAssetInfo] = useState<AssetType>({} as AssetType)
  const [network, setNetwork] = useState<SupportedNetworkNames | undefined>()
  const [searchParams, setSearchParams] = useSearchParams({ network: '' })

  const selectNetwork = useCallback(
    (network: string) => {
      if (!isSupportedNetwork(isEasternEggNetwork(network))) {
        console.error('This network is not supported', network)
        selectNetwork(DEFAULT_NETWORK)
        return
      }

      setNetwork(isEasternEggNetwork(network))
      setSearchParams((prev) => {
        prev.set('network', network)
        return prev
      })
      setLocalStorageNetwork(isEasternEggNetwork(network))
    },
    [setLocalStorageNetwork, setSearchParams],
  )

  useEffect(() => {
    if (!network) {
      const queryStringNetwork = searchParams.get('network')

      // in this order we prefer the network in query string
      // or the local storage or the default
      const selected =
        queryStringNetwork || localStorageNetwork || DEFAULT_NETWORK

      selectNetwork(selected)
    }
  }, [localStorageNetwork, network, searchParams, selectNetwork])

  useEffect(() => {
    if (!network) return

    let client: PolkadotClient

    const altNetworksPolkadot = ['polkadot-lc', 'porkydot']
    const altNetworksKusama = ['kus000mba', 'kusama-lc']

    if ([...altNetworksPolkadot, ...altNetworksKusama].includes(network)) {
      const relay = altNetworksPolkadot.includes(network)
        ? 'polkadot'
        : altNetworksKusama.includes(network)
          ? 'kusama'
          : ''

      if (!relay) return

      const { assetInfo } = getChainInformation(relay)
      setAssetInfo(assetInfo)
      setIsLight(true)
      const smoldot = startFromWorker(new SmWorker())
      let relayChain: Promise<Chain>
      if (relay === 'polkadot') {
        relayChain = import('polkadot-api/chains/polkadot').then(
          ({ chainSpec }) => smoldot.addChain({ chainSpec }),
        )
      } else {
        relayChain = import('polkadot-api/chains/ksmcc3').then(
          ({ chainSpec }) => smoldot.addChain({ chainSpec }),
        )
      }

      client = createClient(getSmProvider(relayChain))
    } else {
      if (
        network === 'polkadot-lc' ||
        network === 'porkydot' ||
        network === 'kusama-lc' ||
        network === 'kus000mba'
      )
        return
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
    if (isLight) {
      client?.finalizedBlock$.subscribe((finalizedBlock) => {
        if (finalizedBlock.number && !lightClientLoaded) {
          setLightClientLoaded(true)
        }
      })
    }
  }, [client?.finalizedBlock$, isLight, lightClientLoaded])

  useEffect(() => {
    const res: TrackList = {}
    if (api) {
      api.constants.Referenda.Tracks()
        .then((tracks) => {
          tracks.forEach(([number, { name }]) => {
            res[number] = name.replace(/_/g, ' ')
          })
        })
        .catch(console.error)

      setTrackList(res)
    }
  }, [api])

  return (
    <NetworkContext.Provider
      value={{
        lightClientLoaded,
        isLight,
        network,
        selectNetwork,
        client,
        api,
        assetInfo,
        trackList,
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
