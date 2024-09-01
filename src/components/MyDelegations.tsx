import { Card } from '@polkadot-ui/react'
import { Title } from './ui/title'
import { TreePalm } from 'lucide-react'
import { useLocks } from '@/contexts/LocksContext'
import { useMemo } from 'react'
import { Skeleton } from './ui/skeleton'
import { useDelegates } from '@/contexts/DelegatesContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { planckToUnit } from '@polkadot-ui/utils'
import { AddressDisplay } from './ui/address-display'
import { Badge } from './ui/badge'

export const MyDelegations = () => {
  const { trackList, assetInfo } = useNetwork()
  const { delegations, getConvictionLockTimeDisplay } = useLocks()
  const noDelegations = useMemo(
    () => !!delegations && Object.entries(delegations).length === 0,
    [delegations],
  )
  const { getDelegateByAddress } = useDelegates()

  return (
    <>
      <Title className="mb-4">My Delegations</Title>
      <div className="flex w-full gap-x-2">
        {delegations === undefined ? (
          <Skeleton className="h-[116px] rounded-xl" />
        ) : noDelegations ? (
          <Card className="mb-5 flex w-4/12 flex-col bg-gray-200 p-4">
            <div className="flex h-full items-center justify-center">
              <TreePalm className="h-12 w-12" />
            </div>
            <div className="mt-4 text-center">
              No delegation yet, get started below!
            </div>
          </Card>
        ) : (
          Object.entries(delegations).map(([key, value]) => {
            const delegate = getDelegateByAddress(key)

            return (
              <Card
                className="relative h-full w-4/12 border-2 bg-white p-2 px-4"
                key={key}
              >
                <div className="flex h-full flex-col">
                  <div>
                    {delegate?.name ? (
                      <div className="flex items-center">
                        <img
                          src={delegate.image}
                          className="mr-2 w-12 rounded-full"
                        />
                        {delegate.name}
                      </div>
                    ) : (
                      <AddressDisplay address={key} size={'3rem'} />
                    )}
                  </div>
                  {value.map(({ balance, trackId, conviction }) => {
                    const { display, multiplier } =
                      getConvictionLockTimeDisplay(conviction.type)
                    return (
                      <div key={trackId} className="mb-2 ml-12 border-l-2 pl-2">
                        <div className="capitalize">
                          <Badge>{trackList[trackId]}</Badge> /{trackId}
                        </div>
                        <div>
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
                </div>
              </Card>
            )
          })
        )}
      </div>
    </>
  )
}
