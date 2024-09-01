import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Delegate } from '@/contexts/DelegatesContext'
import { ContentReveal } from './ui/content-reveal'

interface Props {
  delegate: Delegate
}
export const DelegateCard = ({ delegate: d }: Props) => {
  const [copied, setCopied] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000)
    }
  }, [copied])

  const onDelegate = () => {
    navigate(`/delegate/${d.address}`)
  }

  return (
    <Card className="mb-5 flex flex-col border-2 p-2">
      <div className="flex columns-3">
        <div className="w-[10%] p-2">
          <img className="rounded-3xl" width="100" src={d.image} />
        </div>
        <div className="w-[85%] p-2">
          <div className="py-2 text-xl font-bold text-primary">{d.name}</div>
          <div>{d.shortDescription}</div>
          <ContentReveal
            disabled={
              d.shortDescription === d.longDescription || !d.longDescription
            }
          >
            {d.longDescription}
          </ContentReveal>
        </div>
        <Button variant="default" onClick={onDelegate} className="">
          Delegate
        </Button>
      </div>
      <div className="w-full"></div>
    </Card>
  )
}
