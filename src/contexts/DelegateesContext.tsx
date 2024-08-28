/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { useNetwork } from './NetworkContext'
import { DelegeeListKusama, DelegeeListPolkadot } from '@/lib/constants'
// import { dotApi } from '@/clients'

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
  // const [list, setList] = useState<Delegatee[]>()
  const [delegatees, setDelegatees] = useState<Delegatee[]>([])

  useEffect(() => {
    const fetchOpenPRs = async () => {
      const response = await (
        await fetch(
          network === 'polkadot' ? DelegeeListPolkadot : DelegeeListKusama,
        )!
      ).json()
      setDelegatees(response)
    }
    fetchOpenPRs()
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
