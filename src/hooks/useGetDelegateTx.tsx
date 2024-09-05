import { useAccounts } from '@/contexts/AccountsContext'
import { useLocks } from '@/contexts/LocksContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { dot, MultiAddress, VotingConviction } from '@polkadot-api/descriptors'
import { TypedApi } from 'polkadot-api'
import { useCallback } from 'react'

interface Params {
  target: string
  amount: bigint
  tracks: number[]
  conviction: VotingConviction
}

export const useGetDelegateTx = () => {
  const { api } = useNetwork()
  const { selectedAccount } = useAccounts()
  const { delegations, voteLocks: locks } = useLocks()

  const getDelegationTx = useCallback(
    ({ target, amount, tracks, conviction }: Params) => {
      if (!api || !selectedAccount) return

      const txs: Array<
        | ReturnType<typeof api.tx.ConvictionVoting.remove_vote>
        | ReturnType<typeof api.tx.ConvictionVoting.undelegate>
        | ReturnType<typeof api.tx.ConvictionVoting.delegate>
      > = []

      // first we remove all ongoing votes
      locks
        .filter(({ isOngoing }) => !!isOngoing)
        .forEach(({ refId, trackId }) => {
          txs.push(
            api.tx.ConvictionVoting.remove_vote({
              index: refId,
              class: trackId,
            }),
          )
        })

      // then we remove all ongoing delegations
      Object.values(delegations || {}).forEach((d) => {
        d.map(({ trackId }) => {
          txs.push(api.tx.ConvictionVoting.undelegate({ class: trackId }))
        })
      })

      // then we delegate for the selected tracks
      tracks.forEach((trackId) => {
        txs.push(
          api.tx.ConvictionVoting.delegate({
            class: trackId,
            conviction,
            to: MultiAddress.Id(target),
            balance: amount,
          }),
        )
      })

      return (api as TypedApi<typeof dot>).tx.Utility.batch_all({
        calls: txs.map((tx) => tx.decodedCall),
      })
    },
    [api, delegations, locks, selectedAccount],
  )

  return getDelegationTx
}
