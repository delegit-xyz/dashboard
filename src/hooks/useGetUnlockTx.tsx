import { useAccounts } from '@/contexts/AccountsContext'
import { DelegationLock, LockType, VoteLock } from '@/contexts/LocksContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { MultiAddress } from '@polkadot-api/descriptors'
import { useCallback } from 'react'

export const useGetUnlockTx = () => {
  const { api } = useNetwork()
  const { selectedAccount } = useAccounts()

  const getUnlockTx = useCallback(
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

  return getUnlockTx
}
