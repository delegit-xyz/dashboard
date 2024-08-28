import { type ClassValue, clsx } from 'clsx'
import { House } from 'lucide-react'
import networks from '@/assets/networks.json'

import { twMerge } from 'tailwind-merge'
import type { NetworkType, RouterType } from './types'

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

const routes: RouterType[] = [{ link: 'home', name: 'Home', icon: House }]

const getChainInformation = (networkName: keyof typeof networks) => {
  const network: NetworkType = networks[networkName]
  return {
    assetInfo: network.assets[0],
    wsEndpoint: network.nodes[0].url,
  }
}

export { cn, routes, getChainInformation }
