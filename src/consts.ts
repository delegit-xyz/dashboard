/*
 * Global Constants
 */
const AppVersion = '0.1.1'
const DappName = 'Delegit'
const PolkadotUrl = 'https://delegit-xyz.github.io/dashboard'

const GithubOwner = 'delegit-xyz'

const SideMenuMaximisedWidth = 185
const SideMenuMinimisedWidth = 75
const SideMenuStickyThreshold = 1150
const SectionFullWidthThreshold = 1000
const ShowAccountsButtonWidthThreshold = 825
const FloatingMenuWidth = 250
const SmallFontSizeMaxWidth = 600
const TipsThresholdSmall = 750
const TipsThresholdMedium = 1200

const collapsedWidth = '6rem'
const uncollapsedWidth = '16rem'
const type = 'inline'

type RankInfoType = {
  rank: number
  dan: string
  name: string
  color: string
  salary: number
}

// Page constants
const rankInfo: RankInfoType[] = [
  { rank: 0, dan: '', name: 'Candidate', color: '#00FF00', salary: 0 },
  { rank: 1, dan: 'I', name: 'Member', color: '#0000FF', salary: 10000 },
  { rank: 2, dan: 'II', name: 'Proficient', color: '#00FFFF', salary: 20000 },
  { rank: 3, dan: 'III', name: 'Fellow', color: '#008000', salary: 80000 },
  { rank: 4, dan: 'IV', name: 'Architect', color: '#FFFF00', salary: 120000 },
  {
    rank: 5,
    dan: 'V',
    name: 'Architect Adept',
    color: '#FFA500',
    salary: 160000,
  },
  {
    rank: 6,
    dan: 'VI',
    name: 'Grand Architect',
    color: '#784E00',
    salary: 200000,
  },
  {
    rank: 7,
    dan: 'VII',
    name: 'Free Master',
    color: '#FFC0CB',
    salary: 200000,
  },
  {
    rank: 8,
    dan: 'VIII',
    name: 'Master Constant',
    color: '#FF00FF',
    salary: 200000,
  },
  {
    rank: 9,
    dan: 'IX',
    name: 'Grand Master',
    color: '#FFD700',
    salary: 200000,
  },
]

const msgs = {
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

// Exports
export {
  AppVersion,
  DappName,
  PolkadotUrl,
  GithubOwner,
  // GithubRfc,
  // GithubApiUrl,
  SideMenuMaximisedWidth,
  SideMenuMinimisedWidth,
  SideMenuStickyThreshold,
  SectionFullWidthThreshold,
  ShowAccountsButtonWidthThreshold,
  FloatingMenuWidth,
  SmallFontSizeMaxWidth,
  TipsThresholdSmall,
  TipsThresholdMedium,
  collapsedWidth,
  uncollapsedWidth,
  type,
  // site details
  rankInfo,
  // Alert messsages
  msgs,
}
