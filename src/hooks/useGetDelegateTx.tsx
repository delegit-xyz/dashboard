import { useAccounts } from '@/contexts/AccountsContext'
import { useLocks } from '@/contexts/LocksContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { MultiAddress, VotingConviction } from '@polkadot-api/descriptors'
import { Transaction } from 'polkadot-api'
import { useCallback } from 'react'

interface Params {
  delegateAddress: string
  amount: bigint
  tracks: number[]
  conviction: VotingConviction
}

export interface DelegateTxs {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeVotesTxs?: Transaction<any, any, any, undefined>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeDelegationsTxs?: Transaction<any, any, any, undefined>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delegationTxs?: Transaction<any, any, any, undefined>[]
}

export const useGetDelegateTx = () => {
  const { api } = useNetwork()
  const { selectedAccount } = useAccounts()
  const { delegations, voteLocks } = useLocks()

  const getDelegationTxs = useCallback(
    ({ delegateAddress, amount, tracks, conviction }: Params): DelegateTxs => {
      if (!api || !selectedAccount)
        return {
          removeVotesTxs: [],
          removeDelegationsTxs: [],
          delegationTxs: [],
        }

      const removeVotesTxs = voteLocks.map(({ refId, trackId }) =>
        api.tx.ConvictionVoting.remove_vote({
          index: refId,
          class: trackId,
        }),
      )

      const removeDelegationsTxs: ReturnType<
        typeof api.tx.ConvictionVoting.undelegate
      >[] = []

      Object.values(delegations || {}).forEach((delegation) => {
        delegation.map(({ trackId }) => {
          removeDelegationsTxs.push(
            api.tx.ConvictionVoting.undelegate({ class: trackId }),
          )
        })
      })

      const delegationTxs = tracks.map((trackId) =>
        api.tx.ConvictionVoting.delegate({
          class: trackId,
          conviction,
          to: MultiAddress.Id(delegateAddress),
          balance: amount,
        }),
      )

      return { removeVotesTxs, removeDelegationsTxs, delegationTxs }
    },
    [api, delegations, voteLocks, selectedAccount],
  )

  return getDelegationTxs
}
