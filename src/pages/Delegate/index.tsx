import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  type Delegate as DelegateType,
  useDelegates,
} from '@/contexts/DelegatesContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { VotingConviction } from '@polkadot-api/descriptors'
import { SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAccounts } from '@/contexts/AccountsContext'
import { Slider } from '@/components/ui/slider'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { msgs } from '@/lib/constants'
import { evalUnits, planckToUnit } from '@polkadot-ui/utils'
import { useLocks } from '@/contexts/LocksContext'
import { DelegateTxs, useGetDelegateTx } from '@/hooks/useGetDelegateTx'
import { AlertNote } from '@/components/Alert'
import { useTestTx } from '@/hooks/useTestTx'
import { MultiTransactionDialog } from './MultiTransactionDialog'
import { useGetSigningCallback } from '@/hooks/useGetSigningCallback'
import { Title } from '@/components/ui/title'
import { DelegateCard } from '@/components/DelegateCard'
import { AccountInfoIF, mapRawIdentity } from '@/lib/utils'

export const Delegate = () => {
  const { api, peopleApi, assetInfo } = useNetwork()
  const { address } = useParams()
  const { selectedAccount } = useAccounts()
  const getDelegateTx = useGetDelegateTx()
  const { getConvictionLockTimeDisplay, refreshLocks } = useLocks()
  const getSubscriptionCallBack = useGetSigningCallback()
  const navigate = useNavigate()
  const { search } = useLocation()
  const { getDelegateByAddress, isLoading: isLoadingDelegates } = useDelegates()
  const [delegate, setDelegate] = useState<DelegateType | undefined>()

  const [isAmountDirty, setIsAmountDirty] = useState(false)
  const [amount, setAmount] = useState<bigint>(0n)
  const [amountVisible, setAmountVisible] = useState<string>('0')
  const [amountError, setAmountError] = useState<string>('')
  const [conviction, setConviction] = useState<VotingConviction>(
    VotingConviction.Locked1x(),
  )
  const [convictionNo, setConvictionNo] = useState(1)
  const [isTxInitiated, setIsTxInitiated] = useState(false)
  const { isExhaustsResources } = useTestTx()
  const [isMultiTxDialogOpen, setIsMultiTxDialogOpen] = useState(false)
  const [delegateTxs, setDelegateTxs] = useState<DelegateTxs>({} as DelegateTxs)
  const [noDelegateFound, setNoDelegateFound] = useState(false)

  useEffect(() => {
    // the delegate list may still be loading
    if (isLoadingDelegates || delegate) return

    const foundDelegate = address && getDelegateByAddress(address)

    // if no delegate is found based on the address
    // or there's no address passed in the url
    if (!foundDelegate || !address) {
      setNoDelegateFound(true)
      return
    }

    setDelegate(foundDelegate)
  }, [address, delegate, getDelegateByAddress, isLoadingDelegates])

  const { display: convictionTimeDisplay, multiplier: convictionMultiplier } =
    getConvictionLockTimeDisplay(convictionNo)

  const voteAmount = useMemo(() => {
    if (!convictionMultiplier) return

    const bnAmount =
      convictionMultiplier === 0.1
        ? amount / 10n
        : amount * BigInt(convictionMultiplier)

    return planckToUnit(bnAmount, assetInfo.precision)
  }, [amount, assetInfo.precision, convictionMultiplier])

  const convictionDisplay = useMemo(() => {
    if (!convictionMultiplier) return

    return `x${Number(convictionMultiplier)} | ${convictionTimeDisplay}`
  }, [convictionTimeDisplay, convictionMultiplier])

  const amountErrorDisplay = useMemo(() => {
    if (!isAmountDirty) return ''

    if (amountError) return amountError

    return ''
  }, [amountError, isAmountDirty])

  useEffect(() => {
    // API change denotes that the netowork changed. Due to the fact that
    // decimals of network may change as well we should convert the amount to 0n
    // in order to make sure that correct number will be used.
    setAmount(0n)
    setAmountVisible('0')
  }, [api])

  const [identity, setIdentity] = useState<AccountInfoIF | undefined>()

  useEffect(() => {
    const retrieve = async () => {
      const id = await peopleApi?.query?.Identity.IdentityOf.getValue(address!)

      setIdentity({
        address,
        ...mapRawIdentity(id),
      })
    }
    address && retrieve()
  }, [address, peopleApi])

  useEffect(() => {
    if (!address || delegate) return

    const res = getDelegateByAddress(address)
    setDelegate(res)
  }, [address, delegate, getDelegateByAddress])

  if (!delegate || !api) return <div>No delegate found</div>

  const onChangeAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
    decimals: number,
  ) => {
    setIsAmountDirty(true)
    setAmountError('')
    const [bnResult, errorMessage] = evalUnits(e.target.value, decimals)
    setAmount(bnResult || 0n)
    if (errorMessage) setAmountError(errorMessage)
    setAmountVisible(e.target.value)
  }

  const onChangeSplitTransactionDialog = (isOpen: boolean) => {
    setIsMultiTxDialogOpen(isOpen)
    setIsTxInitiated(false)
  }

  const onProcessFinished = () => {
    refreshLocks()
    navigate(`/${search}`)
    setIsTxInitiated(false)
    onChangeSplitTransactionDialog(false)
  }

  const onSign = async () => {
    if (!delegate || !selectedAccount || !amount || !api) return

    setIsTxInitiated(true)

    const allTracks = await api.constants.Referenda.Tracks()
      .then((tracks) => {
        return tracks.map(([track]) => track)
      })
      .catch((e) => {
        console.error(e)
        setIsTxInitiated(false)
      })

    const {
      delegationTxs = [],
      removeDelegationsTxs = [],
      removeVotesTxs = [],
    } = getDelegateTx({
      delegateAddress: delegate.address,
      conviction: conviction,
      amount,
      tracks: allTracks || [],
    })

    setDelegateTxs({
      removeVotesTxs,
      removeDelegationsTxs,
      delegationTxs,
    })

    const allTxs = api.tx.Utility.batch_all({
      calls: [...removeVotesTxs, ...removeDelegationsTxs, ...delegationTxs].map(
        (tx) => tx.decodedCall,
      ),
    })

    if (!allTxs) {
      setIsTxInitiated(false)
      return
    }

    // check if we have an exhausted limit on the whole tx
    const isExhaustsRessouces = await isExhaustsResources(allTxs)

    // this is too big of a batch we need to split it up
    if (isExhaustsRessouces) {
      setIsMultiTxDialogOpen(true)
      return
    }

    const subscriptionCallBack = getSubscriptionCallBack({
      onError: () => setIsTxInitiated(false),
      onInBlock: () => onProcessFinished(),
    })

    await allTxs
      .signSubmitAndWatch(selectedAccount?.polkadotSigner, { at: 'best' })
      .subscribe(subscriptionCallBack)
  }

  if (noDelegateFound)
    return (
      <div className="mx-auto">
        No delegate found for this address: {address}
      </div>
    )

  if (!delegate || !api)
    return <Loader2 className="mx-auto h-8 w-8 animate-spin" />

  return (
    <main className="m-auto grid w-full max-w-4xl gap-4 p-4 sm:px-6 sm:py-0">
      {!api && (
        <AlertNote
          title={msgs.api.title}
          message={msgs.api.message}
          variant={msgs.api.variant}
        />
      )}
      {!selectedAccount && (
        <AlertNote
          title={msgs.account.title}
          message={msgs.account.message}
          variant={msgs.account.variant}
        />
      )}

      <Link to={`/${search}`} className="flex items-center gap-2 text-primary">
        <ArrowLeft className="h-4 w-4" />
        To all delegates
      </Link>
      <Title>Delegate to {delegate.name}</Title>
      <div className="flex columns-3">
        <DelegateCard
          identity={identity}
          delegate={delegate}
          hasDelegateButton={false}
          hasShareButton
          className="p0 border-none bg-transparent shadow-none"
        />
      </div>
      <div className="grid gap-8 rounded-xl bg-card p-6 shadow-xl">
        <div>
          <Label>Amount</Label>
          <Input
            onChange={(value) => onChangeAmount(value, assetInfo.precision)}
            value={amountVisible}
            error={amountErrorDisplay}
          />
        </div>

        <Label className="flex">
          Conviction: {convictionDisplay}
          <div className="ml-2">{}</div>
        </Label>
        <Slider
          disabled={!api || !selectedAccount}
          value={[convictionNo]}
          defaultValue={[convictionNo]}
          min={0}
          max={6}
          step={1}
          marks
          marksLabels={['0.1', '1', '2', '3', '4', '5', '6']}
          marksPreFix={'x'}
          labelPosition="bottom"
          onValueChange={(v: SetStateAction<number>[]) => {
            const value = v[0] === 0 ? 'None' : `Locked${v[0]}x`
            setConvictionNo(v[0])
            setConviction(
              VotingConviction[value as keyof typeof VotingConviction],
            )
          }}
        />
        <AlertNote
          title={'Note'}
          message={`The ${convictionTimeDisplay} will start when you undelegate`}
          variant={'default'}
        />
        <Button
          onClick={onSign}
          disabled={amount === 0n || !api || !selectedAccount || isTxInitiated}
          loading={isTxInitiated}
        >
          Delegate with {voteAmount} {assetInfo.symbol} votes
        </Button>
      </div>
      <MultiTransactionDialog
        isOpen={isMultiTxDialogOpen}
        onOpenChange={onChangeSplitTransactionDialog}
        delegateTxs={delegateTxs}
        onProcessFinished={onProcessFinished}
      />
    </main>
  )
}
