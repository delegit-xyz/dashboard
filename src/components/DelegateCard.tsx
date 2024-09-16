import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Delegate } from '@/contexts/DelegatesContext'
import { ContentReveal } from './ui/content-reveal'

interface Props {
  delegate: Delegate
}
export const DelegateCard = ({ delegate: d }: Props) => {
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

  return (
    <Card className="mb-5 flex flex-col border p-2">
      <div className="flex flex-col md:flex-row">
        <div className="vertical center p-2">
          <img className="rounded-full" width="100" src={d.image} />
        </div>
        <div className="p-2 md:w-[85%]">
          <div className="py-2 text-xl font-semibold">{d.name}</div>
          <div className="text-slate-600">
            <div className="break-words">{d.shortDescription}</div>
            <ContentReveal
              hidden={
                d.shortDescription === d.longDescription || !d.longDescription
              }
            >
              {d.longDescription}
            </ContentReveal>
          </div>
        </div>
        <Button variant="default" onClick={onDelegate} className="">
          Delegate
        </Button>
      </div>
    </Card>
  )
}
