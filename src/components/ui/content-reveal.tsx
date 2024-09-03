import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  hidden?: boolean
}

export const ContentReveal = ({ children, className, hidden }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (hidden) {
      setIsOpen(false)
    }
  }, [hidden])

  return (
    <div className={cn('break-anywhere', className)}>
      <button
        onClick={() => {
          !hidden && setIsOpen(!isOpen)
        }}
        className={cn(
          `flex w-full items-center justify-center`,
          hidden && 'opacity-0',
        )}
        disabled={hidden}
      >
        <ChevronDown
          className={`transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-auto transition-all duration-300 ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
