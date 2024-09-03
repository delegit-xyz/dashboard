/* eslint-disable react-refresh/only-export-components */
import React, { useState, createContext, useContext } from 'react'
import { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer'
import { Dispatch, SetStateAction } from 'react'

type AccountContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

export interface IAccountContext {
  selectedAccount?: InjectedPolkadotAccount
  setSelectedAccount: Dispatch<
    SetStateAction<InjectedPolkadotAccount | undefined>
  >
}

const AccountContext = createContext<IAccountContext | undefined>(undefined)

const AccountContextProvider = ({ children }: AccountContextProps) => {
  const [selectedAccount, setSelectedAccount] = useState<
    InjectedPolkadotAccount | undefined
  >()
  return (
    <AccountContext.Provider
      value={{
        selectedAccount,
        setSelectedAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

const useAccounts = () => {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccounts must be used within a AccountContextProvider')
  }
  return context
}

export { AccountContextProvider, useAccounts }
