/* eslint-disable react-refresh/only-export-components */
import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
} from 'react'
import { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer'
import { useAccounts as useRedotAccounts } from '@reactive-dot/react'
import { useLocalStorage } from 'usehooks-ts'
import { SELECTED_ACCOUNT_KEY } from '@/lib/constants'

type AccountContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

export interface IAccountContext {
  selectedAccount?: InjectedPolkadotAccount
  accounts: InjectedPolkadotAccount[]
  selectAccount: (account: InjectedPolkadotAccount | undefined) => void
}

const AccountContext = createContext<IAccountContext | undefined>(undefined)

const AccountContextProvider = ({ children }: AccountContextProps) => {
  const accounts = useRedotAccounts()
  const [selectedAccount, setSelected] = useState<
    InjectedPolkadotAccount | undefined
  >()
  const [
    localStorageAccount,
    setLocalStorageAccount,
    removeLocalStorageAccount,
  ] = useLocalStorage(SELECTED_ACCOUNT_KEY, '')

  const selectAccount = useCallback(
    (account: InjectedPolkadotAccount | undefined) => {
      if (!account) {
        removeLocalStorageAccount()
      }
      account?.address && setLocalStorageAccount(account.address)
      setSelected(account)
    },
    [removeLocalStorageAccount, setLocalStorageAccount],
  )

  useEffect(() => {
    if (localStorageAccount) {
      const account = accounts.find(
        (account) => account.address === localStorageAccount,
      )
      !!account && selectAccount(account)
    } else {
      selectAccount(accounts[0])
    }
  }, [accounts, localStorageAccount, selectAccount])

  return (
    <AccountContext.Provider
      value={{
        accounts,
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
