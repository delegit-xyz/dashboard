import { useLocks } from '@/contexts/LocksContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { useGetLocks, VoteLock } from '@/hooks/useGetLocks'
import { convertMiliseconds } from '@/lib/convertMiliseconds'
import { getExpectedBlockTimeMs } from '@/lib/locks'
import { Card } from '@polkadot-ui/react'
import { useEffect, useState } from 'react'
import { evalUnits, planckToUnit } from '@polkadot-ui/utils'

export const LocksCard = () => {
  const { currentLocks } = useLocks()
  const [currentBlock, setCurrentBlock] = useState(0)
  const [expectedBlockTime, setExpectedBlockTime] = useState(0)
  const { api } = useNetwork()
  const { getLocks } = useGetLocks()
  const [locks, setLocks] = useState<VoteLock[]>([])
  const {assetInfo} = useNetwork()

  useEffect(() => {
    getLocks()
      .then((locks) => {
        !!locks && setLocks(locks)
        console.log('----> locks', locks)
      })
      .catch(console.error)
  }, [getLocks])

  useEffect(() => {
    if (!api) return
    const sub = api.query.System.Number.watchValue('best').subscribe(
      (value) => {
        setCurrentBlock(value)
      },
    )

    return () => sub.unsubscribe()
  }, [api, getLocks])

  useEffect(() => {
    if (!api) return

    getExpectedBlockTimeMs(api)
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
        {locks.map(({ amount, endBlock, refId, isOngoing }) => {
          let tempTime = ''
          const remainingTime =
            (Number(endBlock) - currentBlock) * expectedBlockTime
          const { d, h, m, s } = convertMiliseconds(remainingTime)
          tempTime = `${d} days ${h}h ${m}min ${s}s`
          return (
            <div key={refId}>
              <ul>
                <li>ref: {refId}</li>
                <li>Amount: {planckToUnit(amount, assetInfo.precision).toLocaleString('en')}{' '}
                {assetInfo.symbol}}}</li>
                <li>Release: {remainingTime > 0 ? tempTime : 'Free'}</li>
              </ul>
            </div>
          )
        })}
      </Card>
    </>
  )
}
