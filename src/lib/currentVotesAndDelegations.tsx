import { SS58String } from 'polkadot-api'
import { MultiAddress, VotingConviction } from '@polkadot-api/descriptors'
import { ApiType } from '@/contexts/NetworkContext'

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

export const getTracks = async (
  api: ApiType,
): Promise<Record<number, string>> =>
  Object.fromEntries(
    (await api.constants.Referenda.Tracks()).map(([trackId, { name }]) => [
      trackId,
      name
        .split('_')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(' '),
    ]),
  )

export const getVotingTrackInfo = async (
  address: SS58String,
  api: ApiType,
): Promise<Record<number, Casting | Delegating>> => {
  const convictionVoting =
    await api.query.ConvictionVoting.VotingFor.getEntries(address)

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

export const getDelegateTx = async ({
  from,
  target,
  conviction,
  amount,
  tracks,
  api,
}: {
  from: SS58String
  target: SS58String
  conviction: VotingConviction
  amount: bigint
  tracks: Array<number>
  api: ApiType
}) => {
  const tracksInfo = await getVotingTrackInfo(from, api)

  const txs: Array<
    | ReturnType<typeof api.tx.ConvictionVoting.remove_vote>
    | ReturnType<typeof api.tx.ConvictionVoting.undelegate>
    | ReturnType<typeof api.tx.ConvictionVoting.delegate>
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
            api.tx.ConvictionVoting.remove_vote({
              class: trackId,
              index,
            }),
          )
        })
      } else
        txs.push(
          api.tx.ConvictionVoting.undelegate({
            class: trackId,
          }),
        )
    }

    txs.push(
      api.tx.ConvictionVoting.delegate({
        class: trackId,
        conviction,
        to: MultiAddress.Id(target),
        balance: amount,
      }),
    )
  })

  // @ts-expect-error we need to fix this, it appeared once we added the dynamic api (either kusama or polkadot)
  return api.tx.Utility.batch_all({
    calls: txs.map((tx) => tx.decodedCall),
  })
}
