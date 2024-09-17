import { useDelegates } from '@/contexts/DelegatesContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export const RedirectByName = () => {
  const { name, network } = useParams()
  const { getDelegateByName } = useDelegates()
  const { selectNetwork } = useNetwork()
  const navigate = useNavigate()

  const address = useMemo(() => {
    if (!name) return
    return getDelegateByName(name)?.address
  }, [getDelegateByName, name])

  useEffect(() => {
    if (network && address) {
      selectNetwork(network)
      return navigate(`/delegate/${address}?network=${network}`)
    }
  }, [address, getDelegateByName, network, navigate, selectNetwork])

  return null
}
