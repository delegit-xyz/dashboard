import { useNetwork } from '@/contexts/NetworkContext'
import { cn } from '@/lib/utils'
import { Polkicon } from '@polkadot-ui/react'
import { SS58String } from 'polkadot-api'
import { useEffect } from 'react'

type Props = {
  address: string
  size: string | number | undefined
  className?: string
}

export const AddressDisplay = ({ address, size, className = '' }: Props) => {
  const { peopleApi } = useNetwork()

  useEffect(() => {
    const retrieve = async () => {
      console.log(address)
      const some = await peopleApi?.query.Identity.IdentityOf.getValue(
        address as SS58String,
      )
      console.log('some', some)
    }
    retrieve()
  }, [address, peopleApi])

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Polkicon address={address} size={size} copy outerColor="transparent" />
      <span className="text-gray-500">
        {address.slice(0, 6) + '...' + address.slice(-6)}
      </span>
    </div>
  )
}
