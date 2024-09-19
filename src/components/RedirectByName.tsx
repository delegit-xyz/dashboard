import { useDelegates } from '@/contexts/DelegatesContext'
import { isSupportedNetwork, useNetwork } from '@/contexts/NetworkContext'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

export const RedirectByName = () => {
  const { name, network } = useParams()
  const { getDelegateByName, isLoading: isDelegateLoading } = useDelegates()
  const [isDelegateMissing, setIsDelegateMissing] = useState(false)
  const [address, setAddress] = useState('')
  const { selectNetwork } = useNetwork()

  useEffect(() => {
    if (!network || !isSupportedNetwork(network)) {
      setIsDelegateMissing(true)

      return
    }

    selectNetwork(network)
  }, [network, selectNetwork])

  useEffect(() => {
    if (!name) {
      setIsDelegateMissing(true)
      return
    }

    if (isDelegateLoading) return

    const delegate = getDelegateByName(name)

    if (!delegate) {
      setIsDelegateMissing(true)
    } else {
      setAddress(delegate.address)
    }
  }, [getDelegateByName, isDelegateLoading, name, network, selectNetwork])

  if (address && !!network && isSupportedNetwork(network)) {
    return <Navigate to={`/delegate/${address}?network=${network}`} />
  }

  if (!isDelegateMissing) {
    return <Loader2 className="mx-auto h-8 w-8 animate-spin" />
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      Delegate not found for name:{' '}
      <span className="mx-2 font-bold">{name}</span> and network:{' '}
      <span className="mx-2 font-bold">{network}</span>
    </div>
  )
}
