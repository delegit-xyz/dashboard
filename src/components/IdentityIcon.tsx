import { IoCheckmarkCircle, IoMail } from 'react-icons/io5'
import { useIdentity } from '@/hooks/useIdentity'
import { TbCircleDashedMinus, TbWorld } from 'react-icons/tb'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { AnchorLink } from './ui/anchorLink'
import { BsTwitterX } from 'react-icons/bs'
import { MessageCircleDashed, User } from 'lucide-react'

interface Props {
  address: string
}

export const IdentityIcon = ({ address }: Props) => {
  const identity = useIdentity(address)

  if (!identity?.display) return null

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger>
          {identity?.judgement ? (
            <IoCheckmarkCircle className="mr-2 text-green-500" />
          ) : (
            <TbCircleDashedMinus className="mr-2 text-gray-500" />
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto">
          {identity.display && (
            <p className="max-w-[15rem]">{identity.display}</p>
          )}
          {identity.legal && (
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {identity.legal}
            </div>
          )}
          {identity.twitter && (
            <div className="flex items-center gap-2">
              <BsTwitterX />
              <AnchorLink
                href={`https://x.com/${identity.twitter?.toString().replace('@', '')}`}
                target="_blank"
              >
                {identity.twitter}
              </AnchorLink>
            </div>
          )}
          {identity.email && (
            <div className="flex items-center gap-2">
              <IoMail />
              <AnchorLink href={`mailto:${identity.email}`}>
                {identity.email}
              </AnchorLink>
            </div>
          )}
          {identity.web && (
            <div className="flex items-center gap-2">
              <TbWorld />
              <AnchorLink href={identity.web.toString()} target="_blank">
                {identity.web}
              </AnchorLink>
            </div>
          )}
          {identity.matrix && (
            <div className="flex items-center gap-2">
              <MessageCircleDashed />
              {identity.matrix}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
