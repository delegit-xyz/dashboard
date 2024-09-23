import { DispatchError } from '@polkadot-api/descriptors'
import { TxEvent } from 'polkadot-api'
import { toast } from 'sonner'

interface Props {
  onInBlock?: () => void
  onFinalized?: () => void
  onError?: () => void
}

export const useGetSigningCallback =
  () =>
  ({ onError, onFinalized, onInBlock }: Props) => {
    return {
      next: (event: TxEvent) => {
        const promise = () =>
          new Promise((resolve) => setTimeout(resolve, 2000))

        if (event.type === 'broadcasted') {
          toast.promise(promise, {
            loading: 'Broadcasting tx',
            success: 'Tx broadcasted',
            duration: 2000,
          })
        }
        if (event.type === 'txBestBlocksState') {
          toast.success(`Tx in block`)
          onInBlock && onInBlock()
        }
        if (event.type === 'finalized') {
          toast.success(`Tx finalized in block: ${event.block.number}`)
          onFinalized && onFinalized()
        }
      },
      error: (error: DispatchError) => {
        console.error(error)
        toast.error(`Error: ${JSON.stringify(error)}`)
        onError && onError()
      },
    }
  }
