import { useNetwork } from '@/contexts/NetworkContext'

export const useGetSubsquareRefUrl = () => {
  const { network } = useNetwork()

  return (refId: number) =>
    `https://${network}.subsquare.io/referenda/${refId.toString()}`
}
