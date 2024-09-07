import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  hidden?: boolean
  noMaxHeight?: boolean
  title?: string | React.ReactNode
  buttonClassName?: string
}

export const ContentReveal = ({
  children,
  className,
  hidden = false,
  noMaxHeight = false,
  title = '',
  buttonClassName = '',
}: Props) => {
  const maxHeight = noMaxHeight ? '' : 'max-h-96'
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (hidden) {
      setIsOpen(false)
    }
  }, [hidden])

  const toggle = useCallback(() => {
    if (hidden) return

    setIsOpen((prev) => !prev)
  }, [hidden])

  return (
    <div className={cn('break-anywhere', className)}>
      <button
        onClick={toggle}
        className={cn(
          `flex w-full items-center justify-center`,
          hidden && 'opacity-0',
          buttonClassName,
        )}
        disabled={hidden}
      >
        {title && <span className="mr-2">{title}</span>}
        <ChevronDown
          className={`transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-auto transition-all duration-300 ${
          isOpen ? maxHeight : 'max-h-0'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
