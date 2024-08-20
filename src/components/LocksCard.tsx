import { useLocks } from '@/contexts/LocksContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { getExpectedBlockTime } from '@/lib/currentVotesAndDelegations'
import { Card } from '@polkadot-ui/react'
import { useEffect, useState } from 'react'
import moment from 'moment'

function convertMiliseconds(miliseconds: number) {
  let days = 0
  let hours = 0
  let minutes = 0
  let seconds = 0
  let total_hours = 0
  let total_minutes = 0
  let total_seconds = 0

  total_seconds = Math.floor(miliseconds / 1000)
  total_minutes = Math.floor(total_seconds / 60)
  total_hours = Math.floor(total_minutes / 60)
  days = Math.floor(total_hours / 24)

  seconds = total_seconds % 60
  minutes = total_minutes % 60
  hours = total_hours % 24

  return { d: days, h: hours, m: minutes, s: seconds }
}

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
