import { useLocks } from '@/contexts/LocksContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { convertMiliseconds } from '@/lib/convertMiliseconds'
import { getExpectedBlockTime } from '@/lib/locks'
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

  if (!currentLocks || !Object.entries(currentLocks).length) return null

  return (
    <>
      <h1 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
        Locks
      </h1>
      <Card className="border-2 p-2 px-4 mb-5">
        {Object.entries(currentLocks)
          .filter(
            ([, value]) =>
              value.lock.blockNumber > 0n || value.lock.amount > 0n,
          )
          .map(([track, lockValue]) => {
            let tempTime = ''
            const remainingTime =
              (lockValue.lock.blockNumber - currentBlock) * expectedBlockTime
            const { d, h, m, s } = convertMiliseconds(remainingTime)
            tempTime = `${d} days ${h}h ${m}min ${s}s`
            return (
              <div key={track}>
                <ul>
                  <li>track: {track}</li>
                  <li>Amount: {lockValue.lock.amount.toString()}</li>
                  <li>Release: {tempTime}</li>
                </ul>
              </div>
            )
          })}
      </Card>
    </>
  )
}
