import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocation, useNavigate } from 'react-router-dom'
import { Delegate } from '@/contexts/DelegatesContext'
import { ContentReveal } from './ui/content-reveal'
import { cn } from '@/lib/utils'
import { sanitizeString } from '@/lib/utils'
import { useNetwork } from '@/contexts/NetworkContext'
import { toast } from 'sonner'
import { LinkIcon } from 'lucide-react'

import Markdown from 'react-markdown'
import { H, H2, H3, Hr, P } from './ui/md'
import { AnchorLink } from './ui/anchorLink'
import { useCallback, useMemo } from 'react'
import { IdentityInfo } from './IdentityInfo'

interface Props {
  delegate: Delegate
  className?: string
  hasShareButton?: boolean
  hasDelegateButton?: boolean
}

export const DelegateCard = ({
  delegate: { address, longDescription, shortDescription, image, name },
  className,
  hasShareButton,
  hasDelegateButton = true,
}: Props) => {
  const { network } = useNetwork()
  const navigate = useNavigate()
  const { search } = useLocation()
  const copyLink = useMemo(
    () => `${window.location.host}/${network}/${sanitizeString(name)}`,
    [name, network],
  )
  const shouldHideLongDescription =
    !longDescription || longDescription === shortDescription

  const onDelegate = useCallback(() => {
    navigate(`/delegate/${address}${search}`)
  }, [address, navigate, search])

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(copyLink)
    toast.success('Copied to clipboard', {
      duration: 1000,
    })
  }, [copyLink])

  const DelegateAvatar: React.FC = () => {
    const divStyle: React.CSSProperties = {
      backgroundImage: 'url(' + image + ')',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
    return (
      <div
        className="vertical center h-20 w-20 min-w-20 rounded-full border"
        style={divStyle}
      />
    )
  }

  return (
    <Card className={cn('flex flex-col p-4', className)}>
      <div className="flex columns-3">
        <DelegateAvatar />
        <div className="w-full p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 py-2 text-xl font-semibold">
              <IdentityInfo address={address} name={name} />
              {hasShareButton && (
                <Button variant="ghost" onClick={onCopy} size="icon">
                  <LinkIcon className="h-4 w-4 text-accent-foreground" />
                </Button>
              )}
            </div>
          </div>
          <div className="text-accent-foreground">
            <div className="break-words text-lg">{shortDescription}</div>
            <ContentReveal hidden={shouldHideLongDescription}>
              <Markdown
                components={{
                  h1: H,
                  h2: H2,
                  h3: H3,
                  a: AnchorLink,
                  hr: Hr,
                  p: P,
                }}
              >
                {longDescription}
              </Markdown>
            </ContentReveal>
          </div>
        </div>
        <div className="flex gap-1">
          {hasDelegateButton && (
            <Button variant="default" onClick={onDelegate} className="w-full">
              Delegate
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
