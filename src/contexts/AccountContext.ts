/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction, createContext } from 'react'
import { useContext } from 'react'

interface AccountType {
  account: SelectedAccountType
  setAccount: Dispatch<SetStateAction<SelectedAccountType>>
}

import { SelectedAccountType } from '@polkadot-ui/react'
export const AccountContext = createContext<AccountType | undefined>(undefined)

export const useAccountContext = () => useContext(AccountContext)
