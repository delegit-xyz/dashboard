/* eslint-disable react-refresh/only-export-components */
import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
  Dispatch,
} from 'react'
import { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer'
import { useLocalStorage } from 'usehooks-ts'

import { localStorageKeyAccount, useConnect } from '@polkadot-ui/react'

type AccountContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

export interface IAccountContext {
  selectedAccount?: InjectedPolkadotAccount
  setConnAccounts?: Dispatch<React.SetStateAction<InjectedPolkadotAccount[]>>
  accounts: InjectedPolkadotAccount[]
  selectAccount: (account: InjectedPolkadotAccount | undefined) => void
}

const AccountContext = createContext<IAccountContext | undefined>(undefined)

const AccountContextProvider = ({ children }: AccountContextProps) => {
  const [
    localStorageAccount,
    setLocalStorageAccount,
    removeLocalStorageAccount,
  ] = useLocalStorage(localStorageKeyAccount, '')

  const { connectedAccounts, connectedExtensions } = useConnect()

  const [connAccounts, setConnAccounts] =
    useState<InjectedPolkadotAccount[]>(connectedAccounts)

  useEffect(() => {
    const acc: InjectedPolkadotAccount[] = []
    for (const [, value] of connectedExtensions) {
      acc.push(...value.getAccounts())
    }
    setConnAccounts(acc)
  }, [connectedExtensions])

  const [selectedAccount, setSelected] = useState<
    InjectedPolkadotAccount | undefined
  >()

  const selectAccount = useCallback(
    (account: InjectedPolkadotAccount | undefined) => {
      if (!account) {
        removeLocalStorageAccount()
      }

      if (account?.address) setLocalStorageAccount(account.address)

      setSelected(account)
    },
    [removeLocalStorageAccount, setLocalStorageAccount],
  )

  useEffect(() => {
    if (localStorageAccount) {
      const account = connAccounts.find(
        (account) => account.address === localStorageAccount,
      )
      if (account) {
        selectAccount(account)
      }
    } else {
      // selectAccount(connAccounts[0])
    }
  }, [connAccounts, localStorageAccount, selectAccount])

  return (
    <AccountContext.Provider
      value={{
        accounts: connAccounts,
        setConnAccounts,
        selectedAccount,
        selectAccount,
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
