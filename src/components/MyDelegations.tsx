import { Card } from '@polkadot-ui/react'
import { Title } from './ui/title'
import { TreePalm } from 'lucide-react'
import { CurrentDelegation, useLocks } from '@/contexts/LocksContext'
import { useMemo } from 'react'
import { Skeleton } from './ui/skeleton'
import { DelegationCard } from './DelegationCard'

export const MyDelegations = () => {
  const { delegations } = useLocks()
  const noDelegations = useMemo(
    () => !!delegations && Object.entries(delegations).length === 0,
    [delegations],
  )

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

  return (
    <>
      <Title>My Delegations</Title>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {delegationsByDelegateConvictionAmount === undefined ? (
          <Skeleton className="h-[116px] rounded-xl" />
        ) : noDelegations ? (
          <Card className="bg-accent col-span-2 mb-5 p-4">
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
            ([delegateAddress, amountConvictionMap]) => (
              <DelegationCard
                delegateAddress={delegateAddress}
                amountConvictionMap={amountConvictionMap}
                key={delegateAddress}
              />
            ),
          )
        )}
      </div>
    </>
  )
}
