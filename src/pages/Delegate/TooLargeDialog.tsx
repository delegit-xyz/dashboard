import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  callData: string
}

export const TooLargeDialog = ({ isOpen, onOpenChange, callData }: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="max-w-inherit">
          <DialogTitle>Tx too large</DialogTitle>
          <DialogDescription>
            <div className="max-w-inherit m-4">
              We encountered an error, the tx you want to submit is too large
              for the blockchain to accept it. Please get in touch with the
              Delegit team to get help{' '}
              <a
                href="https://github.com/delegit-xyz/dashboard/issues/new"
                target="_blank"
                rel="noreferrer"
                className="text-pink-500"
              >
                on GitHub.
              </a>{' '}
              Sharing the transaction information bellow would help us:
              <pre className="white-space-nowrap word-wrap-anywhere break-anywhere mt-4 whitespace-break-spaces">
                {callData}
              </pre>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
