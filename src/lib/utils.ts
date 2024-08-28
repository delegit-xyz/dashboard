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

interface Vote {
  aye: boolean
  conviction: number
}

export const getVoteFromNumber = (input: number): Vote => ({
  aye: Boolean(input & 0b1000_0000),
  conviction: input & 0b0111_1111,
})

export const getNumberFromVote = ({ aye, conviction }: Vote): number =>
  +aye * 0b1000_0000 + conviction
