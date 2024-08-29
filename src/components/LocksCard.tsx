import { useNetwork } from '@/contexts/NetworkContext'
import { useGetLocks, VoteLock } from '@/hooks/useGetLocks'
import {
  convertMiliseconds,
  displayRemainingTime,
} from '@/lib/convertMiliseconds'
import { getExpectedBlockTimeMs } from '@/lib/locks'
import { Card } from './ui/card'
import { useEffect, useState } from 'react'
import { planckToUnit } from '@polkadot-ui/utils'
import { Button } from './ui/button'
import { Title } from './ui/title'
import { ContentReveal } from './ui/content-reveal'
import { Clock2, LockKeyholeOpen, Vote } from 'lucide-react'
import { Badge } from './ui/badge'

export const LocksCard = () => {
  const [currentBlock, setCurrentBlock] = useState(0)
  const [expectedBlockTime, setExpectedBlockTime] = useState(0)
  const { api } = useNetwork()
  const { getLocks } = useGetLocks()
  const { assetInfo } = useNetwork()
  const [ongoingVoteLocks, setOngoingVoteLocks] = useState<VoteLock[]>([])
  const [freeLocks, setFreeLocks] = useState<VoteLock[]>([])
  const [currentLocks, setCurrentLocks] = useState<VoteLock[]>([])

  useEffect(() => {
    if (!currentBlock) return

    getLocks()
      .then((locks) => {
        if (!locks) return

        const tempOngoingLocks: VoteLock[] = []
        const tempFree: VoteLock[] = []
        const tempCurrent: VoteLock[] = []

        locks.forEach((lock) => {
          if (lock.isOngoing) {
            tempOngoingLocks.push(lock)
          } else if (lock.endBlock <= currentBlock) {
            tempFree.push(lock)
          } else {
            tempCurrent.push(lock)
          }
        })

        setOngoingVoteLocks(tempOngoingLocks)
        setFreeLocks(tempFree)
        setCurrentLocks(tempCurrent)
      })
      .catch(console.error)
  }, [currentBlock, getLocks])

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

  if (!ongoingVoteLocks?.length && !freeLocks?.length && !currentLocks.length)
    return null

  return (
    <div className="flex w-full gap-x-2">
      {freeLocks.length > 0 && (
        <Card className="border-2 p-2 px-4 w-4/12 h-full relative">
          <div className="relative z-10">
            <Title variant="h4">Unlockable</Title>
            <div className="font-bold text-5xl">
              {freeLocks.length}
              <LockKeyholeOpen className="w-8 h-8 inline-block rotate-[10deg] text-gray-200" />
            </div>
            {freeLocks.length > 0 && (
              <>
                <Button className="w-full my-4">Unlock</Button>
                <ContentReveal>
                  {freeLocks.map(({ amount, refId, trackId }) => {
                    return (
                      <div key={refId}>
                        <ul>
                          <li className="mb-2">
                            {trackId} - <Badge>#{refId}</Badge>{' '}
                            {planckToUnit(
                              amount,
                              assetInfo.precision,
                            ).toLocaleString('en')}{' '}
                            {assetInfo.symbol}
                          </li>
                        </ul>
                      </div>
                    )
                  })}
                </ContentReveal>
              </>
            )}
          </div>
        </Card>
      )}
      {currentLocks.length > 0 && (
        <Card className="border-2 p-2 px-4 w-4/12 h-full">
          <Title variant="h4">Locked</Title>
          <div className="font-bold text-5xl">
            {currentLocks.length}
            <Clock2 className="w-8 h-8 inline-block rotate-[10deg] text-gray-200" />
          </div>
          <ContentReveal>
            {currentLocks.map(({ amount, endBlock, refId }) => {
              const remainingTimeMs =
                (Number(endBlock) - currentBlock) * expectedBlockTime
              const remainingDisplay = convertMiliseconds(remainingTimeMs)
              return (
                <div key={refId}>
                  <ul>
                    <li>
                      <Badge>#{refId}</Badge>{' '}
                      {planckToUnit(amount, assetInfo.precision).toLocaleString(
                        'en',
                      )}{' '}
                      {assetInfo.symbol}
                      <br />
                      Remaining: {displayRemainingTime(remainingDisplay)}
                    </li>
                  </ul>
                </div>
              )
            })}
          </ContentReveal>
        </Card>
      )}
      {ongoingVoteLocks.length > 0 && (
        <Card className="border-2 p-2 px-4 w-4/12 h-full">
          <Title variant="h4">Votes</Title>
          <div className="font-bold text-5xl">
            {ongoingVoteLocks.length}
            <Vote className="w-8 h-8 inline-block text-gray-200" />
          </div>
          <ContentReveal>
            {ongoingVoteLocks.map(({ amount, refId }) => {
              return (
                <div key={refId}>
                  <ul>
                    <li>
                      <Badge>#{refId}</Badge>{' '}
                      {planckToUnit(amount, assetInfo.precision).toLocaleString(
                        'en',
                      )}{' '}
                      {assetInfo.symbol}
                    </li>
                  </ul>
                </div>
              )
            })}
          </ContentReveal>
        </Card>
      )}
    </div>
  )
}
