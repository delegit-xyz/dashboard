import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        <input
          type={type}
          className={cn(
            'border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
