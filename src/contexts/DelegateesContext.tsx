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
  delegetees: Delegatee[]
}

const DelegateesContext = createContext<IDelegateesContext | undefined>(
  undefined,
)

const DelegateeContextProvider = ({ children }: DelegateesContextProps) => {
  const { network } = useNetwork()
  const [delegetees, setDelegatees] = useState<Delegatee[]>([])

  useEffect(() => {
    setDelegatees(
      (network === 'polkadot'
        ? polkadotList
        : kusamaList) as unknown as Delegatee[],
    )
  }, [network])

  // Votes thingy - pause for now
  // useEffect(() => {
  //   const a = async (delegetees: any[]) => {
  //     const result: Promise<any>[] = delegetees.map((d) => {
  //       return dotApi.query.ConvictionVoting.VotingFor.getEntries(d.address)
  //     })
  //     await Promise.all(result).then((res) => {
  //       console.log(res)
  //     })
  //   }
  //   a(delegetees)
  // }, [delegetees])

  return (
    <DelegateesContext.Provider value={{ delegetees }}>
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
