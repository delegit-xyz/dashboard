import { Badge } from '@/components/ui/badge'
import { useNetwork } from '@/contexts/NetworkContext'

interface Props {
  trackId: number
}

export const TrackDisplay = ({ trackId }: Props) => {
  const { trackList } = useNetwork()

  return (
    <div className="capitalize" key={trackId}>
      <Badge>{trackList[trackId]}</Badge>
      <span className="ml-2 border-l-2 pl-2 text-xs font-semibold text-slate-400">
        {trackId}
      </span>
    </div>
  )
}
