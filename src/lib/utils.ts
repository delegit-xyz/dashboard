import { type ClassValue, clsx } from 'clsx'
import { House } from 'lucide-react'
import networks from '@/assets/networks.json'

import { twMerge } from 'tailwind-merge'
import type { NetworkType, RouterType, Vote } from './types'
import { ApiType, NetworksFromConfig } from '@/contexts/NetworkContext'
import { MultiAddress } from '@polkadot-api/descriptors'
import { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer'
import { DEFAULT_TIME, lockPeriod, ONE_DAY, THRESHOLD } from './constants'
import { bnMin } from './bnMin'
import { VoteLock } from '@/contexts/LocksContext'

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

export const getVoteFromNumber = (input: number): Vote => ({
  aye: Boolean(input & 0b1000_0000),
  conviction: input & 0b0111_1111,
})

export const getNumberFromVote = ({ aye, conviction }: Vote): number =>
  +aye * 0b1000_0000 + conviction

export const getUnlockUnvoteTx = (
  locks: VoteLock[],
  api: ApiType,
  account: InjectedPolkadotAccount,
) => {
  const tracks = new Set(locks.map((lock) => lock.trackId))

  const unVoteTxs = locks.map((lock) => {
    return api.tx.ConvictionVoting.remove_vote({
      index: lock.refId,
      class: lock.trackId,
    }).decodedCall
  })
  const unlockTxs = Array.from(tracks).map((trackId) => {
    return api.tx.ConvictionVoting.unlock({
      class: trackId,
      target: MultiAddress.Id(account.address),
    }).decodedCall
  })

  return { unVoteTxs, unlockTxs }
}

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
