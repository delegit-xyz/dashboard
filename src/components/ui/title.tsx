interface Props {
  children?: React.ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}
export const Title = ({ children, variant = 'h1' }: Props) => {
  if (variant === 'h1')
    return (
      <h1 className="flex-1 shrink-0 whitespace-nowrap font-unbounded text-2xl font-semibold tracking-tight text-primary sm:grow-0">
        {children}
      </h1>
    )
  if (variant === 'h2')
    return (
      <h2 className="flex-1 shrink-0 whitespace-nowrap font-unbounded text-xl font-semibold tracking-tight text-primary sm:grow-0">
        {children}
      </h2>
    )
  if (variant === 'h3')
    return (
      <h3 className="flex-1 shrink-0 whitespace-nowrap font-unbounded text-lg font-semibold tracking-tight text-primary sm:grow-0">
        {children}
      </h3>
    )
  if (variant === 'h4')
    return (
      <h4 className="flex-1 shrink-0 whitespace-nowrap font-unbounded text-base font-semibold tracking-tight text-primary sm:grow-0">
        {children}
      </h4>
    )

  return (
    <h5 className="flex-1 shrink-0 whitespace-nowrap font-unbounded text-sm font-semibold tracking-tight text-primary sm:grow-0">
      {children}
    </h5>
  )
}
