import { CurrentDelegation, useLocks } from '@/contexts/LocksContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { planckToUnit } from '@polkadot-ui/utils'
import { BadgeCent } from 'lucide-react'
import { Badge } from './ui/badge'
import { ContentReveal } from './ui/content-reveal'
import { TrackDisplay } from './TrackDisplay'

interface Props {
  amountConvictionMap: Record<string, CurrentDelegation[]>
}

export const DelegationByAmountConviction = ({
  amountConvictionMap,
}: Props) => {
  const { assetInfo } = useNetwork()
  const { getConvictionLockTimeDisplay } = useLocks()

  return Object.values(amountConvictionMap).map((sameAcountConvictionArray) => {
    // they all have the same conviction
    const conviction = sameAcountConvictionArray[0].conviction.type
    // they all have the same balance
    const balance = sameAcountConvictionArray[0].balance
    // the tracks are different
    const trackIds = sameAcountConvictionArray.map(({ trackId }) => trackId)

    const { display, multiplier } = getConvictionLockTimeDisplay(
      sameAcountConvictionArray[0].conviction.type,
    )

    return (
      <div
        key={`${conviction}-${balance.toString()}`}
        className="mb-2 ml-12 border-l-2 pl-2"
      >
        {trackIds.length === 1 ? (
          trackIds.map((trackId) => (
            <TrackDisplay key={trackId} trackId={trackId} />
          ))
        ) : (
          <ContentReveal
            title={<Badge>{trackIds.length} tracks</Badge>}
            buttonClassName="w-auto"
          >
            {trackIds.sort().map((trackId) => (
              <TrackDisplay key={trackId} trackId={trackId} />
            ))}
          </ContentReveal>
        )}

        <div className="mt-1">
          <BadgeCent className="inline-block h-4 w-4 text-gray-500" />{' '}
          {planckToUnit(balance, assetInfo.precision).toLocaleString('en')}{' '}
          {assetInfo.symbol}
        </div>
        <div>
          conviction: x{Number(multiplier)}
          <span className="ml-2 border-l-2 pl-2 text-xs font-semibold text-slate-400">
            {display}
          </span>
        </div>
      </div>
    )
  })
}
