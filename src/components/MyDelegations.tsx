import { Card } from '@polkadot-ui/react'
import { Title } from './ui/title'
import { TreePalm } from 'lucide-react'
import { CurrentDelegation, useLocks } from '@/contexts/LocksContext'
import { useCallback, useMemo, useState } from 'react'
import { Skeleton } from './ui/skeleton'
import { useDelegates } from '@/contexts/DelegatesContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { AddressDisplay } from './ui/address-display'
import { Button } from './ui/button'
import { useAccounts } from '@/contexts/AccountsContext'
import { Transaction } from 'polkadot-api'
import { DelegationByAmountConviction } from './DelegationByAmountConviction'
import { toast } from 'sonner'

export const MyDelegations = () => {
  const { api } = useNetwork()
  const { delegations, refreshLocks } = useLocks()
  const [delegateLoading, setDelegatesLoading] = useState<string[]>([])
  const noDelegations = useMemo(
    () => !!delegations && Object.entries(delegations).length === 0,
    [delegations],
  )
  const { getDelegateByAddress } = useDelegates()
  const { selectedAccount } = useAccounts()

  const delegationsByDelegateConvictionAmount = useMemo(() => {
    if (!delegations) return

    const result: Record<string, Record<string, CurrentDelegation[]>> = {}
    Object.entries(delegations).forEach(([delegate, locks]) => {
      locks.forEach(({ balance, conviction, trackId }) => {
        const key = `${conviction.type}-${balance.toString()}`

        if (!result[delegate]) result[delegate] = {}
        if (!result[delegate][key]) result[delegate][key] = []

        result[delegate][key].push({ balance, trackId, conviction })
      })
    })

    return result
  }, [delegations])

  const onUndelegate = useCallback(
    (delegate: string) => {
      if (!api || !selectedAccount || !delegations) return

      const tracks = delegations[delegate].map((d) => d.trackId)

      setDelegatesLoading((prev) => [...prev, delegate])

      // @ts-expect-error we can't strongly type this
      let tx: Transaction<undefined, unknown, unknown, undefined>

      if (tracks.length === 1) {
        tx = api.tx.ConvictionVoting.undelegate({ class: tracks[0] })
      } else {
        const batchTx = tracks.map(
          (t) => api.tx.ConvictionVoting.undelegate({ class: t }).decodedCall,
        )
        tx = api.tx.Utility.batch({ calls: batchTx })
      }

      tx.signSubmitAndWatch(selectedAccount.polkadotSigner).subscribe({
        next: (event) => {
          console.log(event)
          toast.info(`Event ${event.type}`)
          if (event.type === 'finalized') {
            setDelegatesLoading((prev) => prev.filter((id) => id !== delegate))
            refreshLocks()
          }
        },
        error: (error) => {
          console.error(error)
          toast.info(`Event Error: ${JSON.stringify(error)}`)
          setDelegatesLoading((prev) => prev.filter((id) => id !== delegate))
        },
      })
    },
    [api, delegations, refreshLocks, selectedAccount],
  )

  return (
    <>
      <Title className="mt-4">My Delegations</Title>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {delegationsByDelegateConvictionAmount === undefined ? (
          <Skeleton className="h-[116px] rounded-xl" />
        ) : noDelegations ? (
          <Card className="col-span-2 mb-5 bg-accent p-4">
            <div className="flex w-full flex-col justify-center">
              <div className="flex h-full items-center justify-center">
                <TreePalm className="h-12 w-12" />
              </div>
              <div className="mt-4 text-center">
                No delegation yet, get started below!
              </div>
            </div>
          </Card>
        ) : (
          Object.entries(delegationsByDelegateConvictionAmount).map(
            ([delegateAddress, amountConvictionMap]) => {
              const knownDelegate = getDelegateByAddress(delegateAddress)

              return (
                <Card
                  className="flex h-max flex-col justify-between border bg-card p-2 px-4"
                  key={delegateAddress}
                >
                  <>
                    <div className="flex flex-col justify-between">
                      {knownDelegate?.name ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={knownDelegate.image}
                            className="mr-2 w-12 rounded-full"
                          />
                          <div className="py-2 text-xl font-semibold">
                            {knownDelegate.name}
                          </div>
                        </div>
                      ) : (
                        <AddressDisplay
                          address={delegateAddress}
                          size={'3rem'}
                        />
                      )}
                      <DelegationByAmountConviction
                        amountConvictionMap={amountConvictionMap}
                      />
                    </div>
                    <Button
                      className="w-a bottom-0 mb-2 mt-4"
                      variant={'outline'}
                      onClick={() => onUndelegate(delegateAddress)}
                      disabled={delegateLoading.includes(delegateAddress)}
                    >
                      Undelegate
                    </Button>
                  </>
                </Card>
              )
            },
          )
        )}
      </div>
    </>
  )
}
