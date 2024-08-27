import { type ClassValue, clsx } from 'clsx'
import { House } from 'lucide-react'
import networks from '@/lib/networks.json'

import { twMerge } from 'tailwind-merge'
import type { AssetType, NameUrlType, NetworkType, RouterType } from './types'
import { supportedNetworksChainIds } from './constants'

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

const routes: RouterType[] = [{ link: 'home', name: 'Home', icon: House }]

const getSupportedNetworkInfo = (chainId: string): NetworkType => {
  const network = networks.filter((n: { chainId: string }) => {
    if (n.chainId === chainId) {
      return n
    }
  })
  return network[0] as NetworkType
}

const getChainInformation = (nw: string): [string | null, AssetType] => {
  const network: NetworkType = getSupportedNetworkInfo(
    nw === 'polkadot'
      ? supportedNetworksChainIds.polkadot
      : supportedNetworksChainIds.kusama,
  )
  const ws = network?.nodes?.map((n: NameUrlType) => n.url)
  if (!ws) return [null, {} as AssetType]

  const randomWs = Math.floor(Math.random() * ws.length)

  // return 2 values - a random wss (or null) and asset info
  return [ws[randomWs] || null, network.assets[0] || ({} as AssetType)]
}

export { cn, routes, getSupportedNetworkInfo, getChainInformation }
