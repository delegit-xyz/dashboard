import { useLocks } from '@/contexts/LocksContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { getExpectedBlockTime } from '@/lib/currentVotesAndDelegations'
import { Card } from '@polkadot-ui/react'
import { useEffect, useState } from 'react'

export const LocksCard = () => {
  const { currentLocks } = useLocks()
  const [currentBlock, setCurrentBlock] = useState(0)
  const [expectedBlockTime, setExpectedBlockTime] = useState(0)
  const { api } = useNetwork()

  useEffect(() => {
    if (!api) return

    const sub = api.query.System.Number.watchValue('best').subscribe(
      (value) => {
        setCurrentBlock(value)
      },
    )

    return () => sub.unsubscribe()
  }, [api])

  useEffect(() => {
    if (!api) return

    getExpectedBlockTime(api)
      .then((value) => setExpectedBlockTime(Number(value)))
      .catch(console.error)
  }, [api])

  if (!currentLocks) return null

  return (
    <>
      <h1 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
        Locks
      </h1>
      <Card className="border-2 flex flex-col p-2 mb-5">
        {Object.entries(currentLocks).map(([track, lockValue]) => {
          const remainingTime =
            (lockValue.lock.blockNumber - currentBlock) * expectedBlockTime

          return (
            <div key={track}>
              <ul>
                <li>track: {track}</li>
                <li>Amount: {lockValue.lock.amount.toString()}</li>
                <li>Release: {lockValue.lock.blockNumber}</li>
              </ul>
            </div>
          )
        })}
      </Card>
    </>
  )
}
