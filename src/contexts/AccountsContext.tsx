/* eslint-disable react-refresh/only-export-components */
import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
} from 'react'
import { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer'

import { useAccountLocalStorage, useConnect } from '@polkadot-ui/react'

type AccountContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

export interface IAccountContext {
  selectedAccount?: InjectedPolkadotAccount
  accounts: InjectedPolkadotAccount[]
  selectAccount: (account: InjectedPolkadotAccount | undefined) => void
  setAccounts: (accounts: InjectedPolkadotAccount[]) => void
}

const AccountContext = createContext<IAccountContext | undefined>(undefined)

const AccountContextProvider = ({ children }: AccountContextProps) => {
  const [localStorageAccount, setLocalStorageAccount] = useAccountLocalStorage()

  const { connectedAccounts } = useConnect()

  const [accounts, setAccounts] =
    useState<InjectedPolkadotAccount[]>(connectedAccounts)

  const [selectedAccount, setSelected] = useState<
    InjectedPolkadotAccount | undefined
  >()

  const selectAccount = useCallback(
    (account: InjectedPolkadotAccount | undefined) => {
      if (!account) {
        setLocalStorageAccount('')
      }

      if (account?.address) setLocalStorageAccount(account)

      setSelected(account)
    },
    [setLocalStorageAccount],
  )

  useEffect(() => {
    if (accounts?.length !== 0) {
      const account = accounts.find(
        (account) => account.address === localStorageAccount?.address,
      )
      selectAccount(account?.address ? account : accounts[0])
    }
  }, [accounts, localStorageAccount, selectAccount])

  return (
    <AccountContext.Provider
      value={{
        accounts,
        selectedAccount,
        selectAccount,
        setAccounts,
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
