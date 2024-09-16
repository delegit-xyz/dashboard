import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Delegate } from '@/contexts/DelegatesContext'
import { ContentReveal } from './ui/content-reveal'
import { cn } from '@/lib/utils'

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
  const [copied, setCopied] = useState<boolean>(false)
  const navigate = useNavigate()
  const { search } = useLocation()

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000)
    }
  }, [copied])

  const onDelegate = () => {
    navigate(`/delegate/${d.address}${search}`)
  }
  const onCopy = () => {
    navigator.clipboard.writeText(
      window.location.origin + `/delegate/${d.address}${search}`,
    )
    setCopied(true)
  }

  return (
    <Card className={cn('flex flex-col p-4', className)}>
      <div className="flex columns-3">
        <div className="vertical center p-2">
          <img className="rounded-full border" width="100" src={d.image} />
        </div>
        <div className="w-full p-2">
          <div className="py-2 text-xl font-semibold">{d.name}</div>
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
          {hasShareButton && (
            <Button variant="outline" onClick={onCopy}>
              Copy link to profile
            </Button>
          )}
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
