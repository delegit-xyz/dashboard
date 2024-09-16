import { HTMLAttributeAnchorTarget, ReactNode } from 'react'

interface Props {
  href?: string
  children?: ReactNode
  target?: HTMLAttributeAnchorTarget
}

export const AnchorLink = ({ href, children, target = '_blank' }: Props) => {
  return (
    <a
      className="cursor-pointer text-pink-500 underline hover:text-pink-700"
      href={href}
      target={target}
    >
      {children}
    </a>
  )
}
