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

const LOCALSTORAGE_SELECTED_ACCOUNT_KEY = 'delegit.selectedAccount'

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

  const selectAccount = useCallback(
    (account: InjectedPolkadotAccount | undefined) => {
      account?.address &&
        localStorage.setItem(
          LOCALSTORAGE_SELECTED_ACCOUNT_KEY,
          account?.address,
        )
      setSelected(account)
    },
    [],
  )

  useEffect(() => {
    const previousAccountAddress = localStorage.getItem(
      LOCALSTORAGE_SELECTED_ACCOUNT_KEY,
    )

    if (previousAccountAddress) {
      const account = accounts.find(
        (account) => account.address === previousAccountAddress,
      )
      !!account && selectAccount(account)
    } else {
      selectAccount(accounts[0])
    }
  }, [accounts, selectAccount])

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
