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
  dot_ah,
  fastWestend,
  ksm,
  ksmPeople,
  ksm_ah,
  westend,
  westendPeople,
  westend_ah,
} from '@polkadot-api/descriptors'
import {
  ChainDefinition,
  PolkadotClient,
  TypedApi,
  createClient,
} from 'polkadot-api'
import { Chain } from 'polkadot-api/smoldot'
import { getWsProvider } from 'polkadot-api/ws-provider'

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
  | 'kusama-lc'
  | NetworksFromConfig

export type RelayApiType = TypedApi<typeof dot | typeof ksm>
export type ApiType = TypedApi<typeof dot_ah | typeof ksm_ah>
export type PeopleApiType = TypedApi<
  typeof dotPeople | typeof ksmPeople | typeof westendPeople
>

export interface ChainDefinitions {
  main: ChainDefinition
  people: ChainDefinition
  ah: ChainDefinition
}

export const descriptorName: Record<SupportedNetworkNames, ChainDefinitions> = {
  polkadot: { main: dot, people: dotPeople, ah: dot_ah },
  'polkadot-lc': { main: dot, people: dotPeople, ah: dot_ah },
  kusama: { main: ksm, people: ksmPeople, ah: ksm_ah },
  'kusama-lc': { main: ksm, people: ksmPeople, ah: ksm_ah },
  westend: { main: westend, people: westendPeople, ah: westend_ah },
  'fast-westend': { main: fastWestend, people: westendPeople, ah: westend_ah },
}

export type TrackList = Record<number, string>

export interface INetworkContext {
  lightClientLoaded: boolean
  isLight: boolean
  selectNetwork: (network: string, shouldResetAccountAddress?: boolean) => void
  relayApi?: TypedApi<typeof dot | typeof ksm>
  relayClient?: PolkadotClient
  ahClient?: PolkadotClient
  api?: TypedApi<typeof dot_ah | typeof ksm_ah>
  peopleApi?: PeopleApiType
  peopleClient?: PolkadotClient
  network?: SupportedNetworkNames
  assetInfo: AssetType
  trackList: TrackList
  genesisHash: string
}

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
  const [relayClient, setRelayClient] = useState<PolkadotClient>()
  const [peopleClient, setPeopleClient] = useState<PolkadotClient>()
  const [ahClient, setAhClient] = useState<PolkadotClient>()
  const [relayApi, setRelayApi] = useState<RelayApiType>()
  const [api, setApi] = useState<ApiType>()
  const [peopleApi, setPeopleApi] = useState<PeopleApiType>()
  const [trackList, setTrackList] = useState<TrackList>({})

  const [assetInfo, setAssetInfo] = useState<AssetType>({} as AssetType)
  const [network, setNetwork] = useState<SupportedNetworkNames | undefined>()
  const [searchParams, setSearchParams] = useSearchParams({ network: '' })
  const [genesisHash, setGenesisHash] = useState('')

  const selectNetwork = useCallback(
    (network: string) => {
      if (!isSupportedNetwork(network)) {
        console.error('This network is not supported', network)
        selectNetwork(DEFAULT_NETWORK)
        return
      }

      setNetwork(network)

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
    }
  }, [localStorageNetwork, network, searchParams, selectNetwork])

  useEffect(() => {
    if (!network) return

    let relayClient: PolkadotClient
    let peopleClient: PolkadotClient
    let ahClient: PolkadotClient

    if (network === 'polkadot-lc' || network === 'kusama-lc') {
      const relay = network === 'polkadot-lc' ? 'polkadot' : 'kusama'

      const { assetInfo, genesisHash } = getChainInformation(relay)
      setGenesisHash(genesisHash)
      setAssetInfo(assetInfo)
      setIsLight(true)
      const smoldot = startFromWorker(new SmWorker())
      let relayChain: Promise<Chain>
      let peopleChain: Promise<Chain>
      let ahChain: Promise<Chain>
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

        ahChain = Promise.all([
          relayChain,
          import('polkadot-api/chains/polkadot_asset_hub'),
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

        ahChain = Promise.all([
          relayChain,
          import('polkadot-api/chains/ksmcc3_asset_hub'),
        ]).then(([relayChain, { chainSpec }]) =>
          smoldot.addChain({ chainSpec, potentialRelayChains: [relayChain] }),
        )
      }

      relayClient = createClient(getSmProvider(relayChain))
      peopleClient = createClient(getSmProvider(peopleChain))
      ahClient = createClient(getSmProvider(ahChain))
    } else {
      const { assetInfo, wsEndpoint, genesisHash } =
        getChainInformation(network)
      setGenesisHash(genesisHash)
      setAssetInfo(assetInfo)
      setIsLight(false)

      relayClient = createClient(getWsProvider(wsEndpoint))
      let wss: string = ''
      let wssAh: string = ''
      if (network === 'polkadot') {
        wss = 'wss://sys.ibp.network/people-polkadot'
        wssAh = 'wss://sys.ibp.network/asset-hub-polkadot'
      } else if (network === 'kusama') {
        wss = 'wss://sys.ibp.network/people-kusama'
        wssAh = 'wss://sys.ibp.network/asset-hub-kusama'
      } else {
        wss = 'wss://sys.ibp.network/people-westend'
        wssAh = 'wss://sys.ibp.network/asset-hub-westend'
      }
      peopleClient = createClient(getWsProvider(wss))
      ahClient = createClient(getWsProvider(wssAh))
    }

    const descriptors = descriptorName[network]
    const typedRelayApi = relayClient.getTypedApi(descriptors.main)
    const typedApi = ahClient.getTypedApi(descriptors.ah)
    const typedPeopleApi = peopleClient.getTypedApi(descriptors.people)

    setRelayClient(relayClient)
    setPeopleClient(peopleClient)
    setAhClient(ahClient)
    setApi(typedApi)
    setRelayApi(typedRelayApi)
    setPeopleApi(typedPeopleApi)
  }, [network])

  useEffect(() => {
    if (isLight) {
      relayClient?.finalizedBlock$.subscribe((finalizedBlock) => {
        if (finalizedBlock.number && !lightClientLoaded) {
          setLightClientLoaded(true)
        }
      })
    }
  }, [relayClient?.finalizedBlock$, isLight, lightClientLoaded])

  useEffect(() => {
    const res: TrackList = {}
    if (relayApi) {
      relayApi.constants.Referenda.Tracks()
        .then((tracks) => {
          tracks.forEach(([number, { name }]) => {
            res[number] = name.replace(/_/g, ' ')
          })
        })
        .catch(console.error)

      setTrackList(res)
    }
  }, [relayApi])

  return (
    <NetworkContext.Provider
      value={{
        lightClientLoaded,
        isLight,
        network,
        selectNetwork,
        relayClient,
        ahClient,
        api,
        relayApi,
        peopleClient,
        peopleApi,
        assetInfo,
        trackList,
        genesisHash,
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
