import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAccounts } from '@/contexts/AccountsContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { DelegateTxs } from '@/hooks/useGetDelegateTx'
import { useTestTx } from '@/hooks/useTestTx'
import { useState } from 'react'
import { TooLargeDialog } from './TooLargeDialog'

interface Props {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  delegateTxs: DelegateTxs
  onProcessFinished: () => void
}

type Step = 1 | 2

export const MultiTransactionDialog = ({
  isOpen,
  onOpenChange,
  delegateTxs,
  onProcessFinished,
}: Props) => {
  const [step, setStep] = useState<Step>(1)
  const { api } = useNetwork()
  const [isTxInitiated, setIsTxInitiated] = useState(false)
  const { isExhaustsResources } = useTestTx()
  const { selectedAccount } = useAccounts()
  const [waitingForFinalization, setWaitingForFinalization] = useState(false)
  const [promptForHelpCallData, setPromptForHelpCallData] = useState('')

  const onSign = () => {
    step === 1 && onSignStep1()
    step === 2 && onSignStep2()
  }

  const onSignStep1 = async () => {
    if (!api || !selectedAccount) return

    const step1Txs = api.tx.Utility.batch_all({
      calls: [
        ...(delegateTxs.removeDelegationsTxs || []),
        ...(delegateTxs.removeVotesTxs || []),
      ].map((tx) => tx.decodedCall),
    })

    if (!step1Txs) return

    // check if we have an exhausted limit on the 1st tx
    const isExhaustsRessouces = await isExhaustsResources(step1Txs)

    // this is too big of a batch we need to split it up more
    if (isExhaustsRessouces) {
      const callData = await step1Txs.getEncodedData()
      setPromptForHelpCallData(callData.asHex())
      return
    }

    setIsTxInitiated(true)
    ;(await step1Txs)
      .signSubmitAndWatch(selectedAccount?.polkadotSigner)
      .subscribe((event) => {
        console.info(event)

        if (event.type === 'txBestBlocksState' && event.found) {
          if (event.dispatchError) {
            console.error('Tx error', event)
            setIsTxInitiated(false)

            return
          }

          setStep(2)
          setIsTxInitiated(false)
        }
      })
  }

  const onSignStep2 = async () => {
    if (!api || !selectedAccount) return
    setIsTxInitiated(true)

    const step2Txs = api.tx.Utility.batch_all({
      calls: (delegateTxs.delegationTxs || []).map((tx) => tx.decodedCall),
    })

    if (!step2Txs) {
      setIsTxInitiated(false)
      return
    }

    // check if we have an exhausted limit on the 2nd tx
    const isExhaustsRessouces = await isExhaustsResources(step2Txs)

    // this is too big of a batch we need to split it up more
    if (isExhaustsRessouces) {
      const callData = await step2Txs.getEncodedData()
      setPromptForHelpCallData(callData.asHex())
      return
    }

    await step2Txs
      .signSubmitAndWatch(selectedAccount?.polkadotSigner, { at: 'best' })
      .subscribe((event) => {
        console.info(event)

        if (event.type === 'txBestBlocksState' && event.found) {
          if (event.dispatchError) {
            console.error('Tx error', event)
            setIsTxInitiated(false)
          }
          setWaitingForFinalization(true)
        }

        if (event.type === 'finalized') {
          onProcessFinished()
          setIsTxInitiated(false)
          setWaitingForFinalization(false)
        }
      })
  }

  if (promptForHelpCallData)
    return (
      <TooLargeDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        callData={promptForHelpCallData}
      />
    )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Step {step}</DialogTitle>
          <DialogDescription>
            <div className="m-4">
              {step === 1 &&
                'The delegation process is in 2 parts, first please sign a transaction to remove current votes and delegations'}
              {step === 2 && 'Second please sign a transaction to delegate'}
            </div>
            <div className="text-end">
              <Button
                onClick={onSign}
                disabled={isTxInitiated}
                loading={isTxInitiated}
              >
                {!waitingForFinalization && `Sign tx ${step}/2`}
                {waitingForFinalization && 'Waiting for finalization'}
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}