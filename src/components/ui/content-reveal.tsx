import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export const ContentReveal = ({ children, className, disabled }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (disabled) {
      setIsOpen(false)
    }
  }, [disabled])

  return (
    <div className={className}>
      <button
        onClick={() => {
          !disabled && setIsOpen(!isOpen)
        }}
        className={cn(
          `flex w-full items-center justify-center`,
          disabled && 'opacity-0',
        )}
        disabled={disabled}
      >
        <ChevronDown
          className={`transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
