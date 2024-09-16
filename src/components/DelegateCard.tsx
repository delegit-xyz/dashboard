import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocation, useNavigate } from 'react-router-dom'
import { Delegate } from '@/contexts/DelegatesContext'
import { ContentReveal } from './ui/content-reveal'
import Markdown from 'react-markdown'
import { Title, TitleH2, TitleH3 } from './ui/title'
import { AnchorLink } from './ui/anchorLink'

interface Props {
  delegate: Delegate
}
export const DelegateCard = ({
  delegate: { address, longDescription, shortDescription, image, name },
}: Props) => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const shouldHideLongDescription =
    !longDescription || longDescription === shortDescription

  const onDelegate = () => {
    navigate(`/delegate/${address}${search}`)
  }

  return (
    <Card className="mb-5 flex flex-col border p-2">
      <div className="flex flex-col md:flex-row">
        <div className="vertical center p-2">
          <img className="rounded-full" width="100" src={image} />
        </div>
        <div className="p-2 md:w-[85%]">
          <div className="py-2 text-xl font-semibold">{name}</div>
          <div className="text-slate-600">
            <div className="break-words">{shortDescription}</div>
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
        <Button variant="default" onClick={onDelegate}>
          Delegate
        </Button>
      </div>
    </Card>
  )
}
