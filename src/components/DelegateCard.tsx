import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocation, useNavigate } from 'react-router-dom'
import { Delegate } from '@/contexts/DelegatesContext'
import { ContentReveal } from './ui/content-reveal'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { LinkIcon } from 'lucide-react'
import Markdown from 'react-markdown'
import { Title, TitleH2, TitleH3 } from './ui/title'
import { AnchorLink } from './ui/anchorLink'

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
  const navigate = useNavigate()
  const { search } = useLocation()
  const shouldHideLongDescription =
    !longDescription || longDescription === shortDescription

  const onDelegate = () => {
    navigate(`/delegate/${address}${search}`)
  }
  const onCopy = () => {
    navigator.clipboard.writeText(
      window.location.origin + `/delegate/${address}${search}`,
    )
    toast.success('Copied to clipboard', {
      duration: 1000,
    })
  }

  return (
    <Card className={cn('flex flex-col p-4', className)}>
      <div className="flex columns-3">
        <div className="vertical center p-2">
          <img className="rounded-full border" width="100" src={image} />
        </div>
        <div className="w-full p-2">
          <div className="flex items-center gap-1 py-2 text-xl font-semibold">
            {name}
            {hasShareButton && (
              <Button variant="ghost" onClick={onCopy} size="icon">
                <LinkIcon className="h-4 w-4 text-accent-foreground" />
              </Button>
            )}
          </div>
          <div className="text-accent-foreground">
            <div className="break-words text-lg">{shortDescription}</div>
            <ContentReveal hidden={shouldHideLongDescription}>
              <Markdown
                components={{
                  h1: Title,
                  h2: TitleH2,
                  h3: TitleH3,
                  a: AnchorLink,
                }}
              >
                {longDescription}
              </Markdown>
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
