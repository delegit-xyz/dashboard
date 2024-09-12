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
import { BadgeCent, Clock2, Info, LockKeyholeOpen, Vote } from 'lucide-react'
import { Badge } from './ui/badge'
import { dot } from '@polkadot-api/descriptors'
import { useAccounts } from '@/contexts/AccountsContext'
import { TypedApi } from 'polkadot-api'
import {
  DelegationLock,
  LockType,
  useLocks,
  VoteLock,
} from '@/contexts/LocksContext'
import { Skeleton } from './ui/skeleton'
import { useGetUnlockTx } from '@/hooks/useGetUnlockTx'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { TrackDisplay } from './TrackDisplay'

export const LocksCard = () => {
  const [currentBlock, setCurrentBlock] = useState(0)
  const [expectedBlockTime, setExpectedBlockTime] = useState(0)
  const { api, assetInfo } = useNetwork()
  const { voteLocks: locks, delegationLocks } = useLocks()
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
  const getUnlockTx = useGetUnlockTx()

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
      // if the end block is in the future
      // then the funds are locked
      if (lock.endBlock >= currentBlock) {
        tempDelegationLocks.push(lock)
      } else {
        // otherwise, the lock is elapsed and can be freed
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
    const { unVoteTxs, unlockTxs } = getUnlockTx(freeLocks) || {}

    if (!unVoteTxs || !unlockTxs) return

    // We need this to make TS happy for now
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
  }, [api, freeLocks, getUnlockTx, selectedAccount])

  return (
    <div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:flex-row">
      <Card className="h-max border-2 p-2 px-4">
        <div className="relative z-10">
          <div className="flex gap-x-2">
            <Title variant="h4">Unlockable</Title>
            <Popover>
              <PopoverTrigger>
                <Info className="h-3 w-3 text-gray-500" />
              </PopoverTrigger>
              <PopoverContent>
                <p className="max-w-[15rem]">Funds that are unlockable.</p>
              </PopoverContent>
            </Popover>
          </div>
          <div className="font-unbounded text-5xl font-bold">
            {freeLocks.length}
            <LockKeyholeOpen className="ml-1 inline-block h-8 w-8 rotate-[10deg] text-gray-200" />
          </div>
          {freeLocks.length > 0 && (
            <Button
              className="mb-2 mt-4 w-full"
              onClick={onUnlockClick}
              disabled={isUnlockingLoading}
            >
              Unlock
            </Button>
          )}
          <ContentReveal hidden={freeLocks.length == 0}>
            {freeLocks.map((lock) => {
              if (lock.type === LockType.Delegating) {
                const { amount, trackId } = lock
                return (
                  <div key={trackId}>
                    <ul>
                      <li className="mb-2">
                        <div className="capitalize">
                          <span className="capitalize">
                            <TrackDisplay trackId={trackId} />
                          </span>
                          <div>
                            <BadgeCent className="inline-block h-4 w-4 text-gray-500" />{' '}
                            {planckToUnit(
                              amount,
                              assetInfo.precision,
                            ).toLocaleString('en')}{' '}
                            {assetInfo.symbol}
                          </div>
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
                      <div>
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
            })}
          </ContentReveal>
        </div>
      </Card>
      {!locksLoaded ? (
        <>
          <Skeleton className="h-[116px] rounded-xl" />
          <Skeleton className="h-[116px] rounded-xl" />
        </>
      ) : (
        <>
          <Card className="h-max border-2 p-2 px-4">
            <div className="flex gap-x-2">
              <Title variant="h4">Unlocking</Title>
              <Popover>
                <PopoverTrigger>
                  <Info className="h-3 w-3 text-gray-500" />
                </PopoverTrigger>
                <PopoverContent>
                  <p className="max-w-[15rem]">
                    Funds unlockable after a certain time. These locks result either
                    from a vote with conviction casted on a refrendum, or from
                    undelegating.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="font-unbounded text-5xl font-bold">
              {currentLocks.length + currentDelegationLocks.length}
              <Clock2 className="ml-1 inline-block h-8 w-8 rotate-[10deg] text-gray-200" />
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
                          <div>
                            <BadgeCent className="inline-block h-4 w-4 text-gray-500" />{' '}
                            {planckToUnit(
                              amount,
                              assetInfo.precision,
                            ).toLocaleString('en')}{' '}
                            {assetInfo.symbol}
                          </div>
                          <div>
                            <Clock2 className="inline-block h-4 w-4 text-gray-500" />{' '}
                            {displayRemainingTime(remainingDisplay)}
                          </div>
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
                    <div key={trackId} className="mb-4 border-l-2 pl-2">
                      <ul>
                        <li>
                          <TrackDisplay trackId={trackId} />
                          <div className="mt-0.5">
                            <BadgeCent className="inline-block h-4 w-4 text-gray-500" />{' '}
                            {planckToUnit(
                              amount,
                              assetInfo.precision,
                            ).toLocaleString('en')}{' '}
                            {assetInfo.symbol}
                          </div>
                          <div>
                            <Clock2 className="inline-block h-4 w-4 text-gray-500" />{' '}
                            {displayRemainingTime(remainingDisplay)}
                          </div>
                        </li>
                      </ul>
                    </div>
                  )
                })}
              </>
            </ContentReveal>
          </Card>
          <Card className="h-max border-2 p-2 px-4">
            <div className="flex gap-x-2">
              <Title variant="h4">Votes</Title>
              <Popover>
                <PopoverTrigger>
                  <Info className="h-3 w-3 text-gray-500" />
                </PopoverTrigger>
                <PopoverContent>
                  <p className="max-w-[15rem]">
                    Votes casted on a referendum that is still in deciding
                    phase.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="font-unbounded text-5xl font-bold">
              {ongoingVoteLocks.length}
              <Vote className="ml-1 inline-block h-8 w-8 text-gray-200" />
            </div>
            {
              <ContentReveal hidden={!ongoingVoteLocks.length}>
                {ongoingVoteLocks.map(({ amount, refId }) => {
                  return (
                    <div key={refId}>
                      <ul>
                        <li>
                          <Badge>#{refId}</Badge>
                          <div>
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
                })}
              </ContentReveal>
            }
          </Card>
        </>
      )}
    </div>
  )
}
