import { useIdentity } from '@/hooks/useIdentity'
import { cn } from '@/lib/utils'
import { Polkicon } from '@polkadot-ui/react'

type Props = {
  address: string
  size: string | number | undefined
  className?: string
}

export const AddressDisplay = ({ address, size, className = '' }: Props) => {
  const identity = useIdentity(address)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Polkicon address={address} size={size} copy outerColor="transparent" />
      <span className="text-gray-500">
        {identity?.display || address.slice(0, 6) + '...' + address.slice(-6)}
      </span>
    </div>
  )
}
