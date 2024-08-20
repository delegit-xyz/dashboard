import { SS58String } from 'polkadot-api'
import { dotApi } from '../clients'
import { MultiAddress, VotingConviction } from '@polkadot-api/descriptors'
import { DEFAULT_TIME, ONE_DAY, THRESHOLD } from './constants'
import { bnMin } from './bnMin'

// export const getOptimalAmount = async (
//   account: SS58String,
//   at: string = 'best',
// ) => (await dotApi.query.Staking.Ledger.getValue(account, { at }))?.active

export interface Casting {
  type: 'Casting'
  referendums: Array<number>
}

export interface Delegating {
  type: 'Delegating'
  target: SS58String
  amount: bigint
  conviction: VotingConviction
}

export const getTracks = async (): Promise<Record<number, string>> =>
  Object.fromEntries(
    (await dotApi.constants.Referenda.Tracks()).map(([trackId, { name }]) => [
      trackId,
      name
        .split('_')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(' '),
    ]),
  )

export const getVotingTrackInfo = async (
  address: SS58String,
): Promise<Record<number, Casting | Delegating>> => {
  const convictionVoting =
    await dotApi.query.ConvictionVoting.VotingFor.getEntries(address)

  return Object.fromEntries(
    convictionVoting
      .filter(
        ({ value: convictionVote }) =>
          convictionVote.type === 'Delegating' ||
          convictionVote.value.votes.length > 0,
      )
      .map(({ keyArgs: [, votingClass], value: { type, value } }) => [
        votingClass,
        type === 'Casting'
          ? {
              type: 'Casting',
              referendums: value.votes.map(([refId]) => refId),
            }
          : {
              type: 'Delegating',
              target: value.target,
              amount: value.balance,
              conviction: value.conviction,
            },
      ]),
  )
}

export const getDelegateTx = async (
  from: SS58String,
  target: SS58String,
  conviction: VotingConviction,
  amount: bigint,
  tracks: Array<number>,
) => {
  const tracksInfo = await getVotingTrackInfo(from)

  const txs: Array<
    | ReturnType<typeof dotApi.tx.ConvictionVoting.remove_vote>
    | ReturnType<typeof dotApi.tx.ConvictionVoting.undelegate>
    | ReturnType<typeof dotApi.tx.ConvictionVoting.delegate>
  > = []
  tracks.forEach((trackId) => {
    const trackInfo = tracksInfo[trackId]

    if (trackInfo) {
      if (
        trackInfo.type === 'Delegating' &&
        trackInfo.target === target &&
        conviction.type === trackInfo.conviction.type &&
        amount === trackInfo.amount
      )
        return

      if (trackInfo.type === 'Casting') {
        trackInfo.referendums.forEach((index) => {
          txs.push(
            dotApi.tx.ConvictionVoting.remove_vote({
              class: trackId,
              index,
            }),
          )
        })
      } else
        txs.push(
          dotApi.tx.ConvictionVoting.undelegate({
            class: trackId,
          }),
        )
    }

    txs.push(
      dotApi.tx.ConvictionVoting.delegate({
        class: trackId,
        conviction,
        to: MultiAddress.Id(target),
        balance: amount,
      }),
    )
  })

  return dotApi.tx.Utility.batch_all({
    calls: txs.map((tx) => tx.decodedCall),
  })
}

export const getExpectedBlockTime = async (): Promise<bigint> => {
  const expectedBlockTime = await dotApi.constants.Babe.ExpectedBlockTime()
  if (expectedBlockTime) {
    return bnMin(ONE_DAY, expectedBlockTime)
  }

  const thresholdCheck =
    (await dotApi.constants.Timestamp.MinimumPeriod()) > THRESHOLD

  if (thresholdCheck) {
    return bnMin(
      ONE_DAY,
      (await dotApi.constants.Timestamp.MinimumPeriod()) * 2n,
    )
  }

  return bnMin(ONE_DAY, DEFAULT_TIME)
}
