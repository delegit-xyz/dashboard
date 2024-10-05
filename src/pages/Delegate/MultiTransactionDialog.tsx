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
import { useCallback, useState } from 'react'
import { TooLargeDialog } from './TooLargeDialog'
import { useGetSigningCallback } from '@/hooks/useGetSigningCallback'

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
  const [promptForHelpCallData, setPromptForHelpCallData] = useState('')
  const getSubscriptionCallBack = useGetSigningCallback()

  const onSign = () => {
    step === 1 && onSignStep1()
    step === 2 && onSignStep2()
  }

  const onSignStep1 = useCallback(async () => {
    if (!api || !selectedAccount) return
    setIsTxInitiated(true)

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

    const subscriptionCallBack1 = getSubscriptionCallBack({
      onError: () => setIsTxInitiated(false),
      onInBlock: () => {
        setStep(2)
        setIsTxInitiated(false)
      },
    })

    ;(await step1Txs)
      .signSubmitAndWatch(selectedAccount?.polkadotSigner, { at: 'best' })
      .subscribe(subscriptionCallBack1)
  }, [
    api,
    delegateTxs.removeDelegationsTxs,
    delegateTxs.removeVotesTxs,
    getSubscriptionCallBack,
    isExhaustsResources,
    selectedAccount,
  ])

  const onSignStep2 = useCallback(async () => {
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

    const subscriptionCallBack2 = getSubscriptionCallBack({
      onError: () => {
        setIsTxInitiated(false)
      },
      onInBlock: () => {
        onProcessFinished()
        setIsTxInitiated(false)
      },
    })

    await step2Txs
      .signSubmitAndWatch(selectedAccount?.polkadotSigner, { at: 'best' })
      .subscribe(subscriptionCallBack2)
  }, [
    api,
    delegateTxs.delegationTxs,
    getSubscriptionCallBack,
    isExhaustsResources,
    onProcessFinished,
    selectedAccount,
  ])

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
            <div className="my-4">
              {step === 1 &&
                'The delegation process is in 2 parts. First, please sign a transaction to remove current votes and delegations.'}
              {step === 2 &&
                'Votes and delegation are removed. You are now ready to sign a transaction to delegate.'}
            </div>
            <div className="text-end">
              <Button
                onClick={onSign}
                disabled={isTxInitiated}
                loading={isTxInitiated}
              >
                Sign transaction {step} / 2
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
