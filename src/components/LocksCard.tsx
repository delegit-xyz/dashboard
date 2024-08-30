import { useNetwork } from '@/contexts/NetworkContext'
import {
  convertMiliseconds,
  displayRemainingTime,
} from '@/lib/convertMiliseconds'
import { getExpectedBlockTimeMs } from '@/lib/utils'
import { Card } from './ui/card'
import { useCallback, useEffect, useState } from 'react'
import { planckToUnit } from '@polkadot-ui/utils'
import { Button } from './ui/button'
import { Title } from './ui/title'
import { ContentReveal } from './ui/content-reveal'
import { Clock2, LockKeyholeOpen, Vote } from 'lucide-react'
import { Badge } from './ui/badge'
import { dot } from '@polkadot-api/descriptors'
import { useAccounts } from '@/contexts/AccountsContext'
import { TypedApi } from 'polkadot-api'
import { getUnlockUnvoteTx } from '@/lib/utils'
import { useLocks, VoteLock } from '@/contexts/LocksContext'

export const LocksCard = () => {
  const [currentBlock, setCurrentBlock] = useState(0)
  const [expectedBlockTime, setExpectedBlockTime] = useState(0)
  const { api } = useNetwork()
  const { locks } = useLocks()
  const { assetInfo } = useNetwork()
  const [ongoingVoteLocks, setOngoingVoteLocks] = useState<VoteLock[]>([])
  const [freeLocks, setFreeLocks] = useState<VoteLock[]>([])
  const [currentLocks, setCurrentLocks] = useState<VoteLock[]>([])
  const { selectedAccount } = useAccounts()
  const [isUnlockingLoading, setIsUnlockingLoading] = useState(false)

  useEffect(() => {
    if (!currentBlock) return

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
  }, [currentBlock, locks])

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

    getExpectedBlockTimeMs(api)
      .then((value) => setExpectedBlockTime(Number(value)))
      .catch(console.error)
  }, [api])

  const onUnlockClick = useCallback(() => {
    if (!api || !selectedAccount) return

    setIsUnlockingLoading(true)
    const { unVoteTxs, unlockTxs } = getUnlockUnvoteTx(
      freeLocks,
      api,
      selectedAccount,
    )

    // We need thisto make TS happy for now
    const dotApi = api as TypedApi<typeof dot>

    dotApi.tx.Utility.batch({ calls: [...unVoteTxs, ...unlockTxs] })
      .signSubmitAndWatch(selectedAccount.polkadotSigner)
      .subscribe({
        next: (event) => {
          console.log(event)
          if (event.type === 'finalized') {
            setIsUnlockingLoading(false)
          }
        },
        error: (error) => {
          console.error(error)
          setIsUnlockingLoading(false)
        },
      })
  }, [api, freeLocks, selectedAccount])

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
                <Button
                  className="w-full my-4"
                  onClick={onUnlockClick}
                  disabled={isUnlockingLoading}
                >
                  Unlock
                </Button>
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
