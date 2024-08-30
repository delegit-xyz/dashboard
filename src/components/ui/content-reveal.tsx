import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
}

export const ContentReveal = ({ children, className }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-full"
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
