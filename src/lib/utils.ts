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
import { DelegationLock, LockType, VoteLock } from '@/contexts/LocksContext'
import { useEffect, useRef } from 'react'
import { Any } from '@polkadot-ui/react'
import React from 'react'

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
  locks: Array<VoteLock | DelegationLock>,
  api: ApiType,
  account: InjectedPolkadotAccount,
) => {
  const tracks = new Set(locks.map((lock) => lock.trackId))

  const unVoteTxs = locks
    .filter((lock) => lock.type === LockType.Casting)
    .map((lock) => {
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

export const usePrevious = <T>(value: T): T | null => {
  const [current, setCurrent] = React.useState(value)
  const [previous, setPrevious] = React.useState<T | null>(null)

  if (value !== current) {
    setPrevious(current)
    setCurrent(value)
  }

  return previous
}
