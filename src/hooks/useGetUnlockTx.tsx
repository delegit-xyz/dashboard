import { useAccounts } from '@/contexts/AccountsContext'
import { DelegationLock, LockType, VoteLock } from '@/contexts/LocksContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { MultiAddress } from '@polkadot-api/descriptors'
import { useCallback } from 'react'

export const useGetUnlockTx = () => {
  const { relayApi } = useNetwork()
  const { selectedAccount } = useAccounts()

  const getUnlockTx = useCallback(
    (freeLocks: Array<VoteLock | DelegationLock>) => {
      if (!relayApi || !selectedAccount) return

      const tracks = new Set(freeLocks.map((lock) => lock.trackId))

      const unVoteTxs = freeLocks
        .filter((lock) => lock.type === LockType.Casting)
        .map((lock) => {
          return relayApi.tx.ConvictionVoting.remove_vote({
            index: lock.refId,
            class: lock.trackId,
          }).decodedCall
        })

      const unlockTxs = Array.from(tracks).map((trackId) => {
        return relayApi.tx.ConvictionVoting.unlock({
          class: trackId,
          target: MultiAddress.Id(selectedAccount.address),
        }).decodedCall
      })

      return { unVoteTxs, unlockTxs }
    },
    [relayApi, selectedAccount],
  )

  return getUnlockTx
}
