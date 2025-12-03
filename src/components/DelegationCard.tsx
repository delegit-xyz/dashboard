import { useDelegates } from '@/contexts/DelegatesContext'
import { CurrentDelegation, useLocks } from '@/contexts/LocksContext'
import { Card } from '@polkadot-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { DelegationByAmountConviction } from './DelegationByAmountConviction'
import { AddressDisplay } from './ui/address-display'
import { Button } from './ui/button'
import { useGetSigningCallback } from '@/hooks/useGetSigningCallback'
import { useNetwork } from '@/contexts/NetworkContext'
import { useAccounts } from '@/contexts/AccountsContext'
import { Transaction } from 'polkadot-api'

interface Props {
  delegateAddress: string
  amountConvictionMap: Record<string, CurrentDelegation[]>
}

export const DelegationCard = ({
  delegateAddress,
  amountConvictionMap,
}: Props) => {
  const { getDelegateByAddress } = useDelegates()
  const knownDelegate = getDelegateByAddress(delegateAddress)
  const [isUndelegating, setIsUndelegating] = useState(false)
  const { api } = useNetwork()
  const { delegations, refreshLocks } = useLocks()
  const { selectedAccount } = useAccounts()
  const tx = useMemo(() => {
    if (!api || !delegations) {
      return
    }

    const tracks = delegations[delegateAddress].map((d) => d.trackId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tx: Transaction<any, any, any, any>

    if (tracks.length === 1) {
      tx = api.tx.ConvictionVoting.undelegate({ class: tracks[0] })
    } else {
      const batchTx = tracks.map(
        (t) => api.tx.ConvictionVoting.undelegate({ class: t }).decodedCall,
      )
      tx = api.tx.Utility.batch({ calls: batchTx })
    }

    return tx
  }, [api, delegateAddress, delegations])

  const getSubscriptionCallback = useGetSigningCallback()
  const subscriptionCallback = useMemo(
    () =>
      getSubscriptionCallback({
        onError: () => {
          setIsUndelegating(false)
        },
        onInBlock: () => {
          setIsUndelegating(false)
          refreshLocks()
        },
      }),
    [getSubscriptionCallback, refreshLocks],
  )

  const onUndelegate = useCallback(() => {
    if (!tx || !selectedAccount) return

    setIsUndelegating(true)

    tx.signSubmitAndWatch(selectedAccount.polkadotSigner, {
      at: 'best',
    }).subscribe(subscriptionCallback)
  }, [selectedAccount, subscriptionCallback, tx])

  return (
    <Card className="flex h-max flex-col justify-between border bg-card p-2 px-4">
      <div className="flex flex-col justify-between">
        {knownDelegate?.name ? (
          <div className="flex items-center gap-2">
            <img src={knownDelegate.image} className="mr-2 w-12 rounded-full" />
            <div className="py-2 text-xl font-semibold">
              {knownDelegate.name}
            </div>
          </div>
        ) : (
          <AddressDisplay address={delegateAddress} size={'3rem'} />
        )}
        <DelegationByAmountConviction
          amountConvictionMap={amountConvictionMap}
        />
      </div>
      <Button
        className="w-a bottom-0 mb-2 mt-4"
        variant={'outline'}
        onClick={onUndelegate}
        disabled={isUndelegating}
        loading={isUndelegating}
      >
        {isUndelegating ? 'Undelegating...' : 'Undelegate'}
      </Button>
    </Card>
  )
}
