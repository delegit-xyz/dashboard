import { useLocks } from '@/contexts/LocksContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { useEffect, useState } from 'react'

export const LocksCard = () => {
  const { currentLocks } = useLocks()
  const [currentBlock, setCurrentBlock] = useState(0)
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

  if (!currentLocks) return null

  return (
    <div>
      Current block: {currentBlock}
      <br />
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
