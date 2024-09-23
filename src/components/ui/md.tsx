// Markdown elements for react-markdown

import { cn } from '@/lib/utils'

interface Props {
  children?: React.ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}
export const H = ({ children, variant = 'h1' }: Props) => {
  const baseClass = 'font-semibold text-accent-foreground mt-3 mb-1'
  if (variant === 'h1')
    return <h1 className={cn(baseClass, 'text-xl')}>{children}</h1>
  if (variant === 'h2')
    return <h2 className={cn(baseClass, 'text-lg')}>{children}</h2>
  if (variant === 'h3')
    return <h3 className={cn(baseClass, 'text-xs uppercase')}>{children}</h3>
}

export const H2 = ({ children }: Props) => <H variant="h2">{children}</H>
export const H3 = ({ children }: Props) => <H variant="h3">{children}</H>

export const P = ({ children }: Props) => <p className="mb-1">{children}</p>

export const Hr = () => <hr className="my-4" />
