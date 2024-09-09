/* eslint-disable react-refresh/only-export-components */
/*
 * Global Constants
 */

import type { MsgType } from './types'

export const THEME_KEY = 'delegit.theme'
export const SELECTED_ACCOUNT_KEY = 'delegit.selectedAccount'
export const SELECTED_NETWORK = 'delegit.selectedNetwork'

const THRESHOLD = BigInt(500)
const DEFAULT_TIME = BigInt(6000)
const ONE_DAY = BigInt(24 * 60 * 60 * 1000)

const lockPeriod: Record<string, number> = {
  None: 0,
  Locked1x: 1,
  Locked2x: 2,
  Locked3x: 4,
  Locked4x: 8,
  Locked5x: 16,
  Locked6x: 32,
}

const AppVersion = '0.1.1'
const DappName = 'Delegit'
const SiteUrl = 'https://delegit.xyz'

const DelegeeListPolkadot =
  'https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/master/registry/polkadot.json'
const DelegeeListKusama =
  'https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/master/registry/kusama.json'

const GithubOwner = 'delegit-xyz'

const msgs: Record<string, MsgType> = {
  api: {
    title: 'API Error.',
    message: 'API is not connected.This page will not work correctly.',
    variant: 'destructive',
  },
  account: {
    title: 'Wallet is not connected.',
    message:
      'You must connect an account through a wallet. Delegation is disabled.',
    variant: 'destructive',
  },
}

// Exports
export {
  // Site specifics
  THRESHOLD,
  DEFAULT_TIME,
  ONE_DAY,
  lockPeriod,
  AppVersion,
  DappName,
  SiteUrl,
  DelegeeListPolkadot,
  DelegeeListKusama,
  GithubOwner,
  // Alert messsages
  msgs,
}
