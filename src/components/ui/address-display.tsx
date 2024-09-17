import { useNetwork } from '@/contexts/NetworkContext'
import { AccountInfoIF, cn, mapRawIdentity } from '@/lib/utils'
import { Polkicon } from '@polkadot-ui/react'
import { useEffect, useState } from 'react'

type Props = {
  address: string
  size: string | number | undefined
  className?: string
}

export const AddressDisplay = ({ address, size, className = '' }: Props) => {
  const { peopleApi } = useNetwork()

  const [identity, setIdentity] = useState<AccountInfoIF | undefined>()

  useEffect(() => {
    const retrieve = async () => {
      console.log('address', address)
      const id = await peopleApi?.query?.Identity.IdentityOf.getValue(address)
      setIdentity({
        address,
        ...mapRawIdentity(id),
      })
    }
    retrieve()
  }, [address, peopleApi])

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Polkicon address={address} size={size} copy outerColor="transparent" />
      <span className="text-gray-500">
        {identity?.display || address.slice(0, 6) + '...' + address.slice(-6)}
      </span>
    </div>
  )
}
