/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import polkadotList from '@/polkadot.json'
import kusamaList from '@/kusama.json'
import { useNetwork } from './NetworkContext'
// import { dotApi } from '@/clients'
export const DelegeeListPolkadot =
  'https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/master/registry/polkadot.json'
export const DelegeeListKusama =
  'https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/master/registry/kusama.json'

type DelegateesContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

export type Delegatee = {
  address: string
  name: string
  image: string
  shortDescription: string
  longDescription: string
  isOrganization: boolean
}

export interface IDelegateesContext {
  delegatees: Delegatee[]
  getDelegateeByAddress: (address: string) => Delegatee | undefined
}

const DelegateesContext = createContext<IDelegateesContext | undefined>(
  undefined,
)

const DelegateeContextProvider = ({ children }: DelegateesContextProps) => {
  const { network } = useNetwork()
  const [delegatees, setDelegatees] = useState<Delegatee[]>([])

  useEffect(() => {
    setDelegatees(
      (network === 'polkadot'
        ? polkadotList
        : kusamaList) as unknown as Delegatee[],
    )
  }, [network])

  const getDelegateeByAddress = (address: string) =>
    delegatees.find((d) => d.address === address)

  // Votes thingy - pause for now
  // useEffect(() => {
  //   const a = async (delegatees: any[]) => {
  //     const result: Promise<any>[] = delegatees.map((d) => {
  //       return dotApi.query.ConvictionVoting.VotingFor.getEntries(d.address)
  //     })
  //     await Promise.all(result).then((res) => {
  //       console.log(res)
  //     })
  //   }
  //   a(delegatees)
  // }, [delegatees])

  return (
    <DelegateesContext.Provider value={{ delegatees, getDelegateeByAddress }}>
      {children}
    </DelegateesContext.Provider>
  )
}

const useDelegatees = () => {
  const context = useContext(DelegateesContext)
  if (context === undefined) {
    throw new Error(
      'useDelegatees must be used within a DelegateesContextProvider',
    )
  }
  return context
}

export { DelegateeContextProvider, useDelegatees }
