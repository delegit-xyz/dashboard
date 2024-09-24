/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  dot,
  dotPeople,
  fastWestend,
  ksm,
  ksmPeople,
  westend,
  westendPeople,
} from '@polkadot-api/descriptors'
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
import { getChainInformation, getPeopleChainInformation } from '@/lib/utils'
import { AssetType } from '@/lib/types'
import networks from '@/assets/networks.json'
import peopleNetworks from '@/assets/peopleNetworks.json'
import { DEFAULT_NETWORK, SELECTED_NETWORK_KEY } from '@/lib/constants'
import { useLocalStorage } from 'usehooks-ts'
import { useSearchParams } from 'react-router-dom'

type NetworkContextProps = {
  children: React.ReactNode | React.ReactNode[]
}
export type NetworksFromConfig = keyof typeof networks
export type SupportedPeopleNetworkNames = keyof typeof peopleNetworks

export type SupportedNetworkNames =
  | 'polkadot-lc'
  | 'kusama-lc'
  | NetworksFromConfig
export type ApiType = TypedApi<typeof dot | typeof ksm>
export type PeopleApiType = TypedApi<
  typeof dotPeople | typeof ksmPeople | typeof westendPeople
>

export const descriptorName: Record<SupportedNetworkNames, ChainDefinition> = {
  polkadot: dot,
  'polkadot-lc': dot,
  kusama: ksm,
  'kusama-lc': ksm,
  westend: westend,
  'fast-westend': fastWestend,
}
export const descriptorPeopleName: Record<
  SupportedPeopleNetworkNames,
  ChainDefinition
> = {
  polkadotPeople: dotPeople,
  kusamaPeople: ksmPeople,
  westendPeople: westendPeople,
}

export type TrackList = Record<number, string>

export interface INetworkContext {
  lightClientLoaded: boolean
  isLight: boolean
  selectNetwork: (network: string, shouldResetAccountAddress?: boolean) => void
  client?: PolkadotClient
  api?: TypedApi<typeof dot | typeof ksm>
  peopleApi: PeopleApiType
  peopleClient?: PolkadotClient
  network?: SupportedNetworkNames
  peopleNetwork?: SupportedPeopleNetworkNames
  assetInfo: AssetType
  trackList: TrackList
}

export const isSupportedNetwork = (
  network: string,
): network is SupportedNetworkNames =>
  !!descriptorName[network as SupportedNetworkNames]

const extractPeopleFromNetwork = (network: SupportedNetworkNames) =>
  network
    .replace('-lc', '')
    .replace('fast-', '')
    .concat('People') as SupportedPeopleNetworkNames

const NetworkContext = createContext<INetworkContext | undefined>(undefined)

const NetworkContextProvider = ({ children }: NetworkContextProps) => {
  const [localStorageNetwork, setLocalStorageNetwork] = useLocalStorage(
    SELECTED_NETWORK_KEY,
    '',
  )

  const [lightClientLoaded, setLightClientLoaded] = useState<boolean>(false)
  const [isLight, setIsLight] = useState<boolean>(false)
  const [client, setClient] = useState<PolkadotClient>()
  const [peopleClient, setPeopleClient] = useState<PolkadotClient>()
  const [api, setApi] = useState<ApiType>()
  const [peopleApi, setPeopleApi] = useState<PeopleApiType>()
  const [trackList, setTrackList] = useState<TrackList>({})

  const [assetInfo, setAssetInfo] = useState<AssetType>({} as AssetType)
  const [network, setNetwork] = useState<SupportedNetworkNames | undefined>()
  const [peopleNetwork, setPeopleNetwork] =
    useState<SupportedPeopleNetworkNames>(
      extractPeopleFromNetwork(DEFAULT_NETWORK),
    )
  const [searchParams, setSearchParams] = useSearchParams({ network: '' })

  const selectNetwork = useCallback(
    (network: string) => {
      if (!isSupportedNetwork(network)) {
        console.error('This network is not supported', network)
        selectNetwork(DEFAULT_NETWORK)
        setPeopleNetwork(extractPeopleFromNetwork(DEFAULT_NETWORK))
        return
      }

      setNetwork(network)
      setPeopleNetwork(extractPeopleFromNetwork(network))

      setSearchParams((prev) => {
        prev.set('network', network)
        return prev
      })
      setLocalStorageNetwork(network)
    },
    [setLocalStorageNetwork, setSearchParams],
  )

  useEffect(() => {
    if (!network) {
      const queryStringNetwork = searchParams.get('network')

      // in this order we prefer the network in query string
      // or the local storage or the default
      const selected = (queryStringNetwork ||
        localStorageNetwork ||
        DEFAULT_NETWORK) as SupportedNetworkNames

      selectNetwork(selected)
      setPeopleNetwork(extractPeopleFromNetwork(selected))
    }
  }, [localStorageNetwork, network, searchParams, selectNetwork])

  useEffect(() => {
    if (!network) return

    let client: PolkadotClient
    let peopleClient: PolkadotClient

    if (network === 'polkadot-lc' || network === 'kusama-lc') {
      const relay = network === 'polkadot-lc' ? 'polkadot' : 'kusama'

      const { assetInfo } = getChainInformation(relay)
      setAssetInfo(assetInfo)
      setIsLight(true)
      const smoldot = startFromWorker(new SmWorker())
      let relayChain: Promise<Chain>
      let peopleChain: Promise<Chain>
      if (relay === 'polkadot') {
        relayChain = import('polkadot-api/chains/polkadot').then(
          ({ chainSpec }) => smoldot.addChain({ chainSpec }),
        )

        peopleChain = Promise.all([
          relayChain,
          import('polkadot-api/chains/polkadot_people'),
        ]).then(([relayChain, { chainSpec }]) =>
          smoldot.addChain({ chainSpec, potentialRelayChains: [relayChain] }),
        )
      } else {
        relayChain = import('polkadot-api/chains/ksmcc3').then(
          ({ chainSpec }) => smoldot.addChain({ chainSpec }),
        )

        peopleChain = Promise.all([
          relayChain,
          import('polkadot-api/chains/ksmcc3_people'),
        ]).then(([relayChain, { chainSpec }]) =>
          smoldot.addChain({ chainSpec, potentialRelayChains: [relayChain] }),
        )
      }

      client = createClient(getSmProvider(relayChain))
      peopleClient = createClient(getSmProvider(peopleChain))
    } else {
      const { assetInfo, wsEndpoint } = getChainInformation(network)
      setAssetInfo(assetInfo)
      setIsLight(false)

      client = createClient(getWsProvider(wsEndpoint))
      const wss: string = getPeopleChainInformation(peopleNetwork).wsEndpoint
      peopleClient = createClient(getWsProvider(wss))
    }

    const descriptor = descriptorName[network]
    const typedApi = client.getTypedApi(descriptor)

    const descriptorPeople = descriptorPeopleName[peopleNetwork!]
    const typedPeopleApi = peopleClient.getTypedApi(descriptorPeople)

    setClient(client)
    setPeopleClient(peopleClient)
    setApi(typedApi)
    setPeopleApi(typedPeopleApi)
  }, [network, peopleNetwork])

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
        peopleClient,
        peopleApi,
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
