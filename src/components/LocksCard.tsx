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
import { BadgeCent, Clock2, LockKeyholeOpen, Vote } from 'lucide-react'
import { Badge } from './ui/badge'
import { dot } from '@polkadot-api/descriptors'
import { useAccounts } from '@/contexts/AccountsContext'
import { TypedApi } from 'polkadot-api'
import { getUnlockUnvoteTx } from '@/lib/utils'
import {
  DelegationLock,
  LockType,
  useLocks,
  VoteLock,
} from '@/contexts/LocksContext'
import { Skeleton } from './ui/skeleton'

export const LocksCard = () => {
  const [currentBlock, setCurrentBlock] = useState(0)
  const [expectedBlockTime, setExpectedBlockTime] = useState(0)
  const { api, trackList } = useNetwork()
  const { locks, delegationLocks } = useLocks()
  const { assetInfo } = useNetwork()
  const [ongoingVoteLocks, setOngoingVoteLocks] = useState<VoteLock[]>([])
  const [freeLocks, setFreeLocks] = useState<Array<VoteLock | DelegationLock>>(
    [],
  )
  const [locksLoaded, setLocksLoaded] = useState<boolean>(false)
  const [currentLocks, setCurrentLocks] = useState<VoteLock[]>([])
  const [currentDelegationLocks, setCurrentDelegationLocks] = useState<
    DelegationLock[]
  >([])
  const { selectedAccount } = useAccounts()
  const [isUnlockingLoading, setIsUnlockingLoading] = useState(false)

  useEffect(() => {
    if (!currentBlock) return

    const tempOngoingLocks: VoteLock[] = []
    const tempFree: Array<VoteLock | DelegationLock> = []
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

    const tempDelegationLocks: DelegationLock[] = []

    delegationLocks.forEach((lock) => {
      //if the end block is in the future
      if (lock.endBlock >= currentBlock) {
        tempDelegationLocks.push(lock)
      } else {
        // in this case, the lock is elapsed and can be freed
        // check track 15 and 30
        tempFree.push(lock)
      }
    })

    setOngoingVoteLocks(tempOngoingLocks)
    setFreeLocks(tempFree)
    setCurrentLocks(tempCurrent)
    setCurrentDelegationLocks(tempDelegationLocks)
    setLocksLoaded(true)
  }, [currentBlock, delegationLocks, locks])

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

  return (
    <div className="flex w-full gap-x-2">
      {freeLocks.length > 0 && (
        <Card className="relative h-full w-4/12 border-2 p-2 px-4">
          <div className="relative z-10">
            <Title variant="h4">Unlockable</Title>
            <div className="text-5xl font-bold">
              {freeLocks.length}
              <LockKeyholeOpen className="inline-block h-8 w-8 rotate-[10deg] text-gray-200" />
            </div>
            {freeLocks.length > 0 && (
              <>
                <Button
                  className="mb-2 mt-4 w-full"
                  onClick={onUnlockClick}
                  disabled={isUnlockingLoading}
                >
                  Unlock
                </Button>
                <ContentReveal>
                  {freeLocks.map((lock) => {
                    if (lock.type === LockType.Delegating) {
                      const { amount, trackId } = lock
                      return (
                        <div key={trackId}>
                          <ul>
                            <li className="mb-2">
                              <div className="capitalize">
                                <span className="capitalize">
                                  <Badge>{trackList[trackId]}</Badge> /{trackId}
                                </span>
                                <br />
                                <BadgeCent className="inline-block h-4 w-4 text-gray-500" />{' '}
                                {planckToUnit(
                                  amount,
                                  assetInfo.precision,
                                ).toLocaleString('en')}{' '}
                                {assetInfo.symbol}
                              </div>
                            </li>
                          </ul>
                        </div>
                      )
                    }

                    const { amount, refId } = lock
                    return (
                      <div key={refId}>
                        <ul>
                          <li className="mb-2">
                            <Badge>#{refId}</Badge>
                            <br />
                            <BadgeCent className="inline-block h-4 w-4 text-gray-500" />{' '}
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
      {!locksLoaded ? (
        <>
          <Skeleton className="h-[116px] w-4/12 rounded-xl" />
          <Skeleton className="h-[116px] w-4/12 rounded-xl" />
        </>
      ) : (
        <>
          <Card className="h-full w-4/12 border-2 p-2 px-4">
            <Title variant="h4">Locked</Title>
            <div className="text-5xl font-bold">
              {currentLocks.length + currentDelegationLocks.length}
              <Clock2 className="inline-block h-8 w-8 rotate-[10deg] text-gray-200" />
            </div>
            <ContentReveal
              hidden={currentLocks.length + currentDelegationLocks.length === 0}
            >
              <>
                {currentLocks.map(({ amount, endBlock, refId }) => {
                  const remainingTimeMs =
                    (Number(endBlock) - currentBlock) * expectedBlockTime
                  const remainingDisplay = convertMiliseconds(remainingTimeMs)
                  return (
                    <div key={refId}>
                      <ul>
                        <li>
                          <Badge>#{refId}</Badge>
                          <br />
                          <BadgeCent className="inline-block h-4 w-4 text-gray-500" />{' '}
                          {planckToUnit(
                            amount,
                            assetInfo.precision,
                          ).toLocaleString('en')}{' '}
                          {assetInfo.symbol}
                          <br />
                          <Clock2 className="inline-block h-4 w-4 text-gray-500" />{' '}
                          {displayRemainingTime(remainingDisplay)}
                        </li>
                      </ul>
                    </div>
                  )
                })}
                {currentDelegationLocks.map(({ amount, endBlock, trackId }) => {
                  const remainingTimeMs =
                    (Number(endBlock) - currentBlock) * expectedBlockTime
                  const remainingDisplay = convertMiliseconds(remainingTimeMs)
                  return (
                    <div key={trackId}>
                      <ul>
                        <li>
                          <div className="capitalize">
                            <Badge>{trackList[trackId]}</Badge> /{trackId}
                          </div>
                          <BadgeCent className="inline-block h-4 w-4 text-gray-500" />{' '}
                          {planckToUnit(
                            amount,
                            assetInfo.precision,
                          ).toLocaleString('en')}{' '}
                          {assetInfo.symbol}
                          <br />
                          <Clock2 className="inline-block h-4 w-4 text-gray-500" />{' '}
                          {displayRemainingTime(remainingDisplay)}
                        </li>
                      </ul>
                    </div>
                  )
                })}
              </>
            </ContentReveal>
          </Card>
          <Card className="h-full w-4/12 border-2 p-2 px-4">
            <Title variant="h4">Votes</Title>
            <div className="text-5xl font-bold">
              {ongoingVoteLocks.length}
              <Vote className="inline-block h-8 w-8 text-gray-200" />
            </div>
            {
              <ContentReveal hidden={!ongoingVoteLocks.length}>
                {ongoingVoteLocks.map(({ amount, refId }) => {
                  return (
                    <div key={refId}>
                      <ul>
                        <li>
                          <Badge>#{refId}</Badge>
                          <br />
                          <BadgeCent className="inline-block h-4 w-4 text-gray-500" />{' '}
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
            }
          </Card>
        </>
      )}
    </div>
  )
}
