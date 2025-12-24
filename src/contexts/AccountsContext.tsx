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
import { WalletAccount } from '@reactive-dot/core/wallets.js'

type AccountContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

export interface IAccountContext {
  selectedAccount?: InjectedPolkadotAccount | WalletAccount
  accounts: WalletAccount[]
  selectAccount: (account: WalletAccount | undefined) => void
}

const AccountContext = createContext<IAccountContext | undefined>(undefined)

const AccountContextProvider = ({ children }: AccountContextProps) => {
  const accounts = useRedotAccounts()
  const [selectedAccount, setSelected] = useState<WalletAccount | undefined>()
  const [
    localStorageAccount,
    setLocalStorageAccount,
    removeLocalStorageAccount,
  ] = useLocalStorage(SELECTED_ACCOUNT_KEY, '')

  const selectAccount = useCallback(
    (account: WalletAccount | undefined) => {
      if (!account) {
        removeLocalStorageAccount()
      }

      if (account?.id) setLocalStorageAccount(account.id)

      setSelected(account)
    },
    [removeLocalStorageAccount, setLocalStorageAccount],
  )

  useEffect(() => {
    if (localStorageAccount) {
      const account = accounts.find(
        ({ address }) => address === localStorageAccount,
      )
      if (account) {
        selectAccount(account)
      }
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
