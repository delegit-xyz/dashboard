import {
  SupportedPeopleNetworkNames,
  descriptorPeopleName,
} from '@/contexts/NetworkContext'
import { SELECTED_NETWORK_KEY } from '@/lib/constants'
import { createClient } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider/web'

const network = localStorage.getItem(SELECTED_NETWORK_KEY) || 'polkadot'

const peopleClient = createClient(
  getWsProvider('wss://rpc-people-polkadot.luckyfriday.io'),
)

const peopleNetwork = 'people-'.concat(
  network.replace('-lc', ''),
) as SupportedPeopleNetworkNames

const descriptorPeople = descriptorPeopleName[peopleNetwork!]
export const peopleApi = peopleClient.getTypedApi(descriptorPeople)
