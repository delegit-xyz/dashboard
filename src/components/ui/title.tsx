import { cn } from '@/lib/utils'

interface Props {
  children?: React.ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
}
export const Title = ({ children, variant = 'h1', className }: Props) => {
  const baseClass =
    'flex-1 shrink-0 whitespace-nowrap font-unbounded font-semibold tracking-tight text-accent-foreground sm:grow-0'
  if (variant === 'h1')
    return (
      <h1 className={cn(baseClass, 'mt-10 mb-5 text-2xl', className)}>
        {children}
      </h1>
    )
  if (variant === 'h2')
    return <h2 className={cn(baseClass, 'text-xl', className)}>{children}</h2>
  if (variant === 'h3')
    return <h3 className={cn(baseClass, 'text-lg', className)}>{children}</h3>
  if (variant === 'h4')
    return (
      <h4
        className={cn(
          baseClass,
          'text-xs tracking-normal uppercase',
          className,
        )}
      >
        {children}
      </h4>
    )

  return <h5 className={cn(baseClass, 'text-sm', className)}>{children}</h5>
}
