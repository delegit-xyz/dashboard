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
  onOpenChange: (isOpen: boolean) => void
  delegateTxs: DelegateTxs
  onSignDelegations: ({
    onError,
    onInBlock,
  }: {
    onError: () => void
    onInBlock: () => void
  }) => Promise<void>
}

type Step = 1 | 2

export const MultiTransactionDialog = ({
  onOpenChange,
  delegateTxs,
  onSignDelegations,
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

    onSignDelegations({
      onError: () => {
        setIsTxInitiated(false)
      },
      onInBlock: () => {
        setIsTxInitiated(false)
      },
    })
  }, [
    api,
    delegateTxs.delegationTxs,
    isExhaustsResources,
    onSignDelegations,
    selectedAccount,
  ])

  if (promptForHelpCallData)
    return (
      <TooLargeDialog
        isOpen
        onOpenChange={onOpenChange}
        callData={promptForHelpCallData}
      />
    )

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Step {step}</DialogTitle>
          <DialogDescription>
            <div className="my-4">
              {step === 1 &&
                "First, let's clear previous votes or delegations."}
              {step === 2 && 'Now, we are ready to delegate.'}
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
