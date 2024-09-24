import { LucideProps } from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

export type RouterType = {
  link?: string
  name: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
}

export type MsgType = {
  title: string
  message: string
  variant?: 'destructive' | 'default'
}

export type NameUrl = {
  url: string
  name: string
}

export type TypeUrl = {
  type: string
  url: string
}

export type AssetType = {
  assetId: number
  symbol: string
  precision: number
  priceId?: string
  staking: string
  icon: string
  name: string
}

export type ExplorerType = {
  name?: string
  extrinsic?: string
  account?: string
  multisig?: string
  event?: string
}

export type PeopleNetworkType = {
  nodes: NameUrl[]
}

export type NetworkType = {
  name: string
  specName: string
  addressPrefix: number
  chainId: string
  icon: string
  options: string[]
  nodes: NameUrl[]
  assets: AssetType[]
  explorers?: ExplorerType[]
  externalApi?: {
    staking?: TypeUrl[]
    history?: TypeUrl[]
  }
}

export interface Vote {
  aye: boolean
  conviction: number
}
