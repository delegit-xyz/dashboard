/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import delegateesList from '@/polkadot.json'
// import { dotApi } from '@/clients'

type DelegateesContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

type DelegateeProps = {
  address: string
  name: string
  image: string
  shortDescription: string
  longDescription: string
  isOrganization: boolean
}

export interface IDelegateesContext {
  delegetees: DelegateeProps[]
}

const DelegateesContext = createContext<IDelegateesContext | undefined>(
  undefined,
)

const DelegateeContextProvider = ({ children }: DelegateesContextProps) => {
  const [delegetees, setDelegatees] = useState<DelegateeProps[]>([])

  useEffect(() => {
    setDelegatees(delegateesList as DelegateeProps[])
  }, [])

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
