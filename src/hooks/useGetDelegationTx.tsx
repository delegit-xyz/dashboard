import { useAccounts } from '@/contexts/AccountsContext'
import {
  DelegationLock,
  LockType,
  useLocks,
  VoteLock,
} from '@/contexts/LocksContext'
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

export const useGetDelegationTx = () => {
  const { api } = useNetwork()
  const { selectedAccount } = useAccounts()
  const { delegations, locks } = useLocks()

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

  const getUnlockUnvoteTx = useCallback(
    (freeLocks: Array<VoteLock | DelegationLock>) => {
      if (!api || !selectedAccount) return

      const tracks = new Set(freeLocks.map((lock) => lock.trackId))

      const unVoteTxs = freeLocks
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
          target: MultiAddress.Id(selectedAccount.address),
        }).decodedCall
      })

      return { unVoteTxs, unlockTxs }
    },
    [api, selectedAccount],
  )

  return { getDelegationTx, getUnlockUnvoteTx }
}
