import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, InfoIcon } from 'lucide-react'

interface Props {
  title?: string
  message: string | React.ReactNode
  variant?: 'default' | 'destructive' | null
}

export const AlertNote = ({ title, message, variant = 'default' }: Props) => (
  <Alert variant={variant}>
    {variant === 'destructive' && <AlertCircle className="h-4 w-4" />}
    {variant === 'default' && <InfoIcon className="h-4 w-4" />}
    {title && <AlertTitle>{title}</AlertTitle>}
    <AlertDescription>{message}</AlertDescription>
  </Alert>
)
