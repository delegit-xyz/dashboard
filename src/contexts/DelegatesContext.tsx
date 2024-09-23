/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { useNetwork } from './NetworkContext'
import { DelegateListKusama, DelegateListPolkadot } from '@/lib/constants'
import { sanitizeString, shuffleArray } from '@/lib/utils'

type DelegatesContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

export type Delegate = {
  address: string
  name: string
  image: string
  shortDescription: string
  longDescription: string
  isOrganization: boolean
}

export interface IDelegatesContext {
  isLoading: boolean
  delegates: Delegate[]
  getDelegateByAddress: (address: string) => Delegate | undefined
  getDelegateByName: (name: string) => Delegate | undefined
}

const DelegatesContext = createContext<IDelegatesContext | undefined>(undefined)

const DelegateContextProvider = ({ children }: DelegatesContextProps) => {
  const { network } = useNetwork()
  const [delegates, setDelegates] = useState<Delegate[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!network) return
    setIsLoading(true)
    const networkToFetch =
      network === 'polkadot' || network === 'polkadot-lc'
        ? DelegateListPolkadot
        : DelegateListKusama

    fetch(networkToFetch)
      .then(async (response) => {
        const result = await response.json()
        const randomized = shuffleArray(result) as Delegate[]
        setDelegates(randomized)
        setIsLoading(false)
      })
      .catch(console.error)
  }, [network])

  const getDelegateByAddress = (address: string) =>
    delegates.find((d) => d.address === address)

  const getDelegateByName = (name: string) =>
    delegates.find((d) => sanitizeString(d.name) == name.toLowerCase())

  // Votes thingy - pause for now
  // useEffect(() => {
  //   const a = async (delegates: any[]) => {
  //     const result: Promise<any>[] = delegates.map((d) => {
  //       return dotApi.query.ConvictionVoting.VotingFor.getEntries(d.address)
  //     })
  //     await Promise.all(result).then((res) => {
  //       console.log(res)
  //     })
  //   }
  //   a(delegates)
  // }, [delegates])

  return (
    <DelegatesContext.Provider
      value={{ delegates, getDelegateByAddress, getDelegateByName, isLoading }}
    >
      {children}
    </DelegatesContext.Provider>
  )
}

const useDelegates = () => {
  const context = useContext(DelegatesContext)
  if (context === undefined) {
    throw new Error(
      'useDelegates must be used within a DelegatesContextProvider',
    )
  }
  return context
}

export { DelegateContextProvider, useDelegates }
