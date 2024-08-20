import { type ClassValue, clsx } from 'clsx'
import { LucideProps, House } from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type RouterType = {
  link?: string
  name: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
}

export const routes: RouterType[] = [
  { link: 'home', name: 'Home', icon: House },
]
