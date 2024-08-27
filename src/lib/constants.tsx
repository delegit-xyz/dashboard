/* eslint-disable react-refresh/only-export-components */
/*
 * Global Constants
 */

import type { MsgType } from './types'

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
const PolkadotUrl = 'https://delegit-xyz.github.io/dashboard'

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
  zeroAmount: {
    title: 'Invalid Amount',
    message: 'Please type an amount to delegate.',
  },
}

const supportedNetworksChainIds = {
  polkadot:
    '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  kusama: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
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
  PolkadotUrl,
  GithubOwner,
  supportedNetworksChainIds,
  // Alert messsages
  msgs,
}
