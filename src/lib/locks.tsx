import { SS58String } from 'polkadot-api'
import { DEFAULT_TIME, lockPeriod, ONE_DAY, THRESHOLD } from './constants'
import { bnMin } from './bnMin'
import { ApiType } from '@/contexts/NetworkContext'

export interface Locks {
  [k: string]: {
    type: 'Casting' | 'Delegating'
    lock: {
      blockNumber: number
      amount: bigint
    }
  }
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

export const getLocksInfo = async (address: SS58String, api: ApiType) => {
  const convictionVoting =
    await api.query.ConvictionVoting.VotingFor.getEntries(address)

  const allDelegationLocks = Object.fromEntries(
    convictionVoting
      .filter(({ value: convictionVoting }) => !!convictionVoting.value.prior)
      .map(({ keyArgs: [, votingTrack], value: { type, value } }) => [
        votingTrack,
        {
          type,
          lock: {
            blockNumber: value.prior[0],
            amount: value.prior[1],
          },
        },
      ]),
  )

  return allDelegationLocks
}

// const getTotalLocks = () => {
//   if (votingService.isCasting(voting)) {
//     const maxVote = Object.values(voting.votes).reduce<BN>((acc, vote) => {
//       if (votingService.isStandardVote(vote)) {
//         acc = bnMax(vote.balance, acc)
//       }
//       if (votingService.isSplitVote(vote)) {
//         acc = bnMax(vote.aye.add(vote.nay), acc)
//       }
//       if (votingService.isSplitAbstainVote(vote)) {
//         acc = bnMax(vote.aye.add(vote.nay).add(vote.abstain), acc)
//       }

//       return acc
//     }, BN_ZERO)

//     return bnMax(maxVote, voting.prior.amount)
//   }

//   if (votingService.isDelegating(voting)) {
//     return bnMax(voting.balance, voting.prior.amount)
//   }

//   return BN_ZERO
// }
