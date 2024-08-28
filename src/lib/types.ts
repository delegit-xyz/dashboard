import { LucideProps } from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

type RouterType = {
  link?: string
  name: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
}

type MsgType = {
  title: string
  message: string
  variant?: 'destructive' | 'default'
}

type NameUrl = {
  url: string
  name: string
}

type TypeUrl = {
  type: string
  url: string
}

type AssetType = {
  assetId: number
  symbol: string
  precision: number
  priceId?: string
  staking: string
  icon: string
  name: string
}

type ExplorerType = {
  name?: string
  extrinsic?: string
  account?: string
  multisig?: string
  event?: string
}

type NetworkType = {
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

export type { NetworkType, RouterType, AssetType, NameUrl, TypeUrl, MsgType }
