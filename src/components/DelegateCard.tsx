import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Copy, Ellipsis } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ellipsisFn } from '@polkadot-ui/utils'
import { useNavigate } from 'react-router-dom'
import copy from 'copy-to-clipboard'
import { useEffect, useState } from 'react'
import { Delegate } from '@/contexts/DelegatesContext'

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
    <Card className="border-2 flex flex-col p-2 mb-5">
      <div className="flex columns-3">
        <div className="p-2 w-[10%]">
          <img className="rounded-3xl" width="100" src={d.image} />
        </div>
        <div className="p-2 w-[85%]">
          <div className="font-bold">{d.name}</div>
          <div className="">{d.shortDescription}</div>
          <Button variant="default" className="mt-2" onClick={onDelegate}>
            Delegate
          </Button>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={'outline'} className="text-xs">
              <Ellipsis className="text-xs" />
            </Button>
          </DialogTrigger>
          <DialogContent className="">
            <DialogHeader>
              <div className="font-bold">{d.name}</div>
            </DialogHeader>
            <DialogDescription className="flex">
              <div>{ellipsisFn(d.address)}</div>
              <div className="pl-4 cursor-pointer">
                {copied ? (
                  <Check className="text-[green]" />
                ) : (
                  <Copy
                    className="cursor-pointer"
                    onClick={() => {
                      setCopied(true)
                      copy(d.address)
                    }}
                  />
                )}
              </div>
            </DialogDescription>
            <div className="grid py-4">
              <div className="items-center">{d.longDescription}</div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="w-full"></div>
    </Card>
  )
}