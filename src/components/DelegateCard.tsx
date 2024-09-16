import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocation, useNavigate } from 'react-router-dom'
import { Delegate } from '@/contexts/DelegatesContext'
import { ContentReveal } from './ui/content-reveal'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { LinkIcon } from 'lucide-react'

interface Props {
  delegate: Delegate
  className?: string
  hasShareButton?: boolean
  hasDelegateButton?: boolean
}

export const DelegateCard = ({
  delegate: d,
  className,
  hasShareButton,
  hasDelegateButton = true,
}: Props) => {
  const navigate = useNavigate()
  const { search } = useLocation()

  const onDelegate = () => {
    navigate(`/delegate/${d.address}${search}`)
  }
  const onCopy = () => {
    navigator.clipboard.writeText(
      window.location.origin + `/delegate/${d.address}${search}`,
    )
    toast.success('Copied to clipboard', {
      duration: 1000,
    })
  }

  return (
    <Card className={cn('flex flex-col p-4', className)}>
      <div className="flex columns-3">
        <div className="vertical center p-2">
          <img className="rounded-full border" width="100" src={d.image} />
        </div>
        <div className="w-full p-2">
          <div className="flex items-center gap-1 py-2 text-xl font-semibold">
            {d.name}
            {hasShareButton && (
              <Button variant="ghost" onClick={onCopy} size="icon">
                <LinkIcon className="h-4 w-4 text-accent-foreground" />
              </Button>
            )}
          </div>
          <div className="text-accent-foreground">
            <div className="break-words text-lg">{d.shortDescription}</div>
            <ContentReveal
              hidden={
                d.shortDescription === d.longDescription || !d.longDescription
              }
            >
              {d.longDescription}
            </ContentReveal>
          </div>
        </div>
        <div className="flex gap-1">
          {hasDelegateButton && (
            <Button variant="default" onClick={onDelegate}>
              Delegate
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
