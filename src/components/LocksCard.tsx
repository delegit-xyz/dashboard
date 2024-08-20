import { dotApi } from '@/clients'
import { useLocks } from '@/contexts/LocksContext'
import { useEffect, useState } from 'react'

export const LocksCard = () => {
  const { currentLocks } = useLocks()
  const [currentBlock, setCurrentBlock] = useState(0)

  useEffect(() => {
    const sub = dotApi.query.System.Number.watchValue('best').subscribe(
      (value) => {
        setCurrentBlock(value)
      },
    )

    return () => sub.unsubscribe()
  }, [])

  if (!currentLocks) return null

  return (
    <div>
      Current locks:
      <br />
      {Object.entries(currentLocks).map(([track, lockValue]) => (
        <div key={track}>
          <ul>
            <li>track: {track}</li>
            <li>Amount: {lockValue.lock.amount.toString()}</li>
            <li>Release: {lockValue.lock.blockNumber}</li>
          </ul>
        </div>
      ))}
    </div>
  )
}
