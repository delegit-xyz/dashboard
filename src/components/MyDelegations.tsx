import { Card } from '@polkadot-ui/react'
import { Title } from './ui/title'
import { BadgeCent, TreePalm } from 'lucide-react'
import { useLocks } from '@/contexts/LocksContext'
import { useCallback, useMemo, useState } from 'react'
import { Skeleton } from './ui/skeleton'
import { useDelegates } from '@/contexts/DelegatesContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { planckToUnit } from '@polkadot-ui/utils'
import { AddressDisplay } from './ui/address-display'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ContentReveal } from './ui/content-reveal'
import { useAccounts } from '@/contexts/AccountsContext'
import { Transaction, TypedApi } from 'polkadot-api'
import { dot } from '@polkadot-api/descriptors'

export const MyDelegations = () => {
  const { trackList, assetInfo, api } = useNetwork()
  const { delegations, getConvictionLockTimeDisplay, refreshLocks } = useLocks()
  const [delegateLoading, setDelegatesLoading] = useState<string[]>([])
  const noDelegations = useMemo(
    () => !!delegations && Object.entries(delegations).length === 0,
    [delegations],
  )
  const { getDelegateByAddress } = useDelegates()
  const { selectedAccount } = useAccounts()

  const onUndelegate = useCallback(
    (delegate: string) => {
      if (!api || !selectedAccount || !delegations) return

      const tracks = delegations[delegate].map((d) => d.trackId)

      setDelegatesLoading((prev) => [...prev, delegate])

      // @ts-expect-error we can't strongly type this
      let tx: Transaction<undefined, unknown, unknown, undefined>

      if (tracks.length === 1) {
        tx = api.tx.ConvictionVoting.undelegate({ class: tracks[0] })
      } else {
        const batchTx = tracks.map(
          (t) => api.tx.ConvictionVoting.undelegate({ class: t }).decodedCall,
        )
        tx = (api as TypedApi<typeof dot>).tx.Utility.batch({ calls: batchTx })
      }

      tx.signSubmitAndWatch(selectedAccount.polkadotSigner).subscribe({
        next: (event) => {
          console.log(event)
          if (event.type === 'finalized') {
            setDelegatesLoading((prev) => prev.filter((id) => id !== delegate))
            refreshLocks()
          }
        },
        error: (error) => {
          console.error(error)
          setDelegatesLoading((prev) => prev.filter((id) => id !== delegate))
        },
      })
    },
    [api, delegations, refreshLocks, selectedAccount],
  )

  return (
    <>
      <Title className="mt-4">My Delegations</Title>
      <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
        {delegations === undefined ? (
          <Skeleton className="h-[116px] rounded-xl" />
        ) : noDelegations ? (
          <Card className="col-span-2 mb-5 bg-accent p-4">
            <div className="flex w-full flex-col justify-center">
              <div className="flex h-full items-center justify-center">
                <TreePalm className="h-12 w-12" />
              </div>
              <div className="mt-4 text-center">
                No delegation yet, get started below!
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex w-full gap-x-2">
            {Object.entries(delegations).map(([key, value]) => {
              const delegate = getDelegateByAddress(key)

              return (
                <Card
                  className="flex h-full flex-col border bg-card p-2 px-4"
                  key={key}
                >
                  <>
                    {delegate?.name ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={delegate.image}
                          className="mr-2 w-12 rounded-full"
                        />
                        <div className="py-2 text-xl font-semibold">
                          {delegate.name}
                        </div>
                      </div>
                    ) : (
                      <AddressDisplay address={key} size={'3rem'} />
                    )}
                    <div className="mb-4 ml-12 pl-2">
                      <Title variant={'h4'}>Delegating on tracks:</Title>
                    </div>
                    <ContentReveal noMaxHeight={true}>
                      {value.map(({ balance, trackId, conviction }) => {
                        const { display, multiplier } =
                          getConvictionLockTimeDisplay(conviction.type)
                        return (
                          <div
                            key={trackId}
                            className="mb-4 ml-12 border-l-2 pl-2"
                          >
                            <div className="capitalize">
                              <Badge>{trackList[trackId]}</Badge>
                              <span className="ml-2 border-l-2 pl-2 text-xs font-semibold text-slate-400">
                                {trackId}
                              </span>
                            </div>
                            <div className="mt-1">
                              <BadgeCent className="inline-block h-4 w-4 text-gray-500" />{' '}
                              {planckToUnit(
                                balance,
                                assetInfo.precision,
                              ).toLocaleString('en')}{' '}
                              {assetInfo.symbol}
                            </div>
                            <div>
                              conviction: x{Number(multiplier)} | {display}
                            </div>
                          </div>
                        )
                      })}
                    </ContentReveal>
                    <Button
                      className="mb-2 mt-4 w-full"
                      variant={'outline'}
                      onClick={() => onUndelegate(key)}
                      disabled={delegateLoading.includes(key)}
                    >
                      Undelegate
                    </Button>
                  </>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
