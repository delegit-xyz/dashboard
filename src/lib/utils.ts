import { type ClassValue, clsx } from 'clsx'
import { House } from 'lucide-react'
import networks from '@/assets/networks.json'
import peopleNetworks from '@/assets/peopleNetworks.json'

import { twMerge } from 'tailwind-merge'
import type { NetworkType, PeopleNetworkType, RouterType, Vote } from './types'
import {
  ApiType,
  NetworksFromConfig,
  SupportedPeopleNetworkNames,
} from '@/contexts/NetworkContext'
import { DEFAULT_TIME, lockPeriod, ONE_DAY, THRESHOLD } from './constants'
import { bnMin } from './bnMin'

const randomFromInterval = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min)

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const routes: RouterType[] = [
  { link: 'home', name: 'Home', icon: House },
]

export const getChainInformation = (networkName: NetworksFromConfig) => {
  const network: NetworkType = networks[networkName]
  return {
    assetInfo: network.assets[0],
    wsEndpoint: network.nodes[0].url,
  }
}

export const getPeopleChainInformation = (
  peopleName: SupportedPeopleNetworkNames,
) => {
  const peopleNetwork: PeopleNetworkType = peopleNetworks[peopleName]
  const pick = randomFromInterval(0, peopleNetwork.nodes.length - 1)
  return {
    wsEndpoint: peopleNetwork.nodes[pick].url,
  }
}

export const getVoteFromNumber = (input: number): Vote => ({
  aye: Boolean(input & 0b1000_0000),
  conviction: input & 0b0111_1111,
})

export const getNumberFromVote = ({ aye, conviction }: Vote): number =>
  +aye * 0b1000_0000 + conviction

export const indexToConviction = (index: number) => {
  return Object.keys(lockPeriod)[index]
}

const convictionList = Object.keys(lockPeriod)

export const getExpectedBlockTimeMs = async (api: ApiType): Promise<bigint> => {
  const expectedBlockTime = await api.constants.Babe.ExpectedBlockTime()
  if (expectedBlockTime) {
    return bnMin(ONE_DAY, expectedBlockTime)
  }

  const thresholdCheck =
    (await api.constants.Timestamp.MinimumPeriod()) > THRESHOLD

  if (thresholdCheck) {
    return bnMin(ONE_DAY, (await api.constants.Timestamp.MinimumPeriod()) * 2n)
  }

  return bnMin(ONE_DAY, DEFAULT_TIME)
}

export const getLockTimes = async (api: ApiType) => {
  const voteLockingPeriodBlocks =
    await api.constants.ConvictionVoting.VoteLockingPeriod()

  const expectedBlockTimeMs = await getExpectedBlockTimeMs(api)

  const requests = convictionList.map((conviction) => {
    const lockTimeMs =
      expectedBlockTimeMs *
      BigInt(voteLockingPeriodBlocks) *
      BigInt(lockPeriod[conviction])

    return [conviction, lockTimeMs] as const
  })

  return requests.reduce(
    (acc, [conviction, lockPeriod]) => {
      acc[conviction] = lockPeriod

      return acc
    },
    {} as Record<string, bigint>,
  )
}

export const sanitizeString = (value: string) =>
  value
    // remove all emojis
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      '',
    )
    // replace all strange characters with underscores
    .replace(/[\W_]+/g, '_')
    .toLowerCase()

// thanks to https://stackoverflow.com/a/2450976/3086912
export const shuffleArray = (arrayToShuffle: unknown[]) => {
  const array = [...arrayToShuffle]
  let currentIndex = array.length

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

// PEOPLE CHAIN RELATED
export type AccountInfoIF = {
  address: string | number
  display?: string | number
  legal?: string | number
  matrix?: string | number
  email?: string | number
  twitter?: string | number
  web?: string | number
  judgement?: boolean
}

export const acceptedJudgement = ['Reasonable', 'FeePaid', 'KnownGood']
export const notAcceptedJudgement = [
  'Unknown',
  'OutOfDate',
  'LowQuality',
  'Erroneous',
]
