interface Props {
  children?: React.ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}
export const Title = ({ children, variant = 'h1' }: Props) => {
  if (variant === 'h1')
    return (
      <h1 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-2xl font-semibold tracking-tight sm:grow-0">
        {children}
      </h1>
    )
  if (variant === 'h2')
    return (
      <h2 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
        {children}
      </h2>
    )
  if (variant === 'h3')
    return (
      <h3 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-lg font-semibold tracking-tight sm:grow-0">
        {children}
      </h3>
    )
  if (variant === 'h4')
    return (
      <h4 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-base font-semibold tracking-tight sm:grow-0">
        {children}
      </h4>
    )

  return (
    <h5 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-sm font-semibold tracking-tight sm:grow-0">
      {children}
    </h5>
  )
}
