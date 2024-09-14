import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface Props {
  title: string
  message: string
  variant?: 'default' | 'destructive' | null
}

export const AlertNote = ({ title, message, variant = 'default' }: Props) => (
  <Alert variant={variant}>
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
)
