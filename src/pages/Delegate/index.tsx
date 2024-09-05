import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDelegates } from '@/contexts/DelegatesContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { VotingConviction } from '@polkadot-api/descriptors'
import { SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getDelegateTx } from '@/lib/currentVotesAndDelegations'
import { useAccounts } from '@/contexts/AccountsContext'
import { Slider } from '@/components/ui/slider'
import { Link, useParams } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { msgs } from '@/lib/constants'
import { evalUnits, planckToUnit } from '@polkadot-ui/utils'
import { useLocks } from '@/contexts/LocksContext'

type AlertProps = {
  title: string
  message: string
  variant?: 'default' | 'destructive' | null | undefined
}
const AlertNote = ({ title, message, variant = 'default' }: AlertProps) => (
  <Alert variant={variant}>
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
)

export const Delegate = () => {
  const { api, assetInfo } = useNetwork()
  const { address } = useParams()
  const { getConvictionLockTimeDisplay } = useLocks()

  const { getDelegateByAddress } = useDelegates()
  const [delegate, setDelegate] = useState(
    address && getDelegateByAddress(address),
  )
  const [isAmountDirty, setIsAmountDirty] = useState(false)
  const [amount, setAmount] = useState<bigint>(0n)
  const [amountVisible, setAmountVisible] = useState<string>('0')
  const [amountError, setAmountError] = useState<string>('')
  const [conviction, setConviction] = useState<VotingConviction>(
    VotingConviction.None,
  )
  const [convictionNo, setConvictionNo] = useState(0)
  const { selectedAccount } = useAccounts()

  const convictionDisplay = useMemo(() => {
    const { display, multiplier } = getConvictionLockTimeDisplay(convictionNo)

    return `x${Number(multiplier)} | ${display}`
  }, [convictionNo, getConvictionLockTimeDisplay])

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

  const onSign = async () => {
    if (selectedAccount && amount) {
      const allTracks = await api.constants.Referenda.Tracks()
        .then((tracks) => {
          return tracks.map(([track]) => track)
        })
        .catch(console.error)

      const tx = getDelegateTx({
        from: selectedAccount?.address,
        target: delegate.address,
        conviction: conviction,
        amount,
        tracks: allTracks || [],
        api,
      })

      ;(await tx)
        .signSubmitAndWatch(selectedAccount?.polkadotSigner)
        .forEach((value) => console.log('value', value))
    } else {
      return
    }
  }

  return (
    <main className="mx-0 grid flex-1 items-start gap-4 p-4 sm:mx-[5%] sm:px-6 sm:py-0 gap-8 xl:mx-[20%]">
      {!api && (
        <AlertNote
          title={msgs.api.title}
          message={msgs.api.message}
          variant={
            msgs.api.variant as 'default' | 'destructive' | null | undefined
          }
        />
      )}
      {!selectedAccount && (
        <AlertNote
          title={msgs.account.title}
          message={msgs.account.message}
          variant={
            msgs.account.variant as 'default' | 'destructive' | null | undefined
          }
        />
      )}

      <Link to="/home" className="flex items-center gap-2 text-primary">
        <ArrowLeft className="h-4 w-4"/>
        To all delegates
      </Link>
      <h1 className="flex-1 shrink-0 whitespace-nowrap font-unbounded text-xl font-semibold tracking-tight sm:grow-0">
        Delegate to {delegate.name}
      </h1>
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
        min={0}
        max={6}
        step={1}
        marks
        marksLabels={['0.1', '1', '2', '3', '4', '5', '6']}
        marksPreFix={'x'}
        labelPosition="bottom"
        onValueChange={(v: SetStateAction<number>[]) => {
          const value = v[0] === 0 ? '0.1' : `Locked${v[0]}x`
          setConvictionNo(v[0])
          setConviction(
            VotingConviction[value as keyof typeof VotingConviction],
          )
        }}
      />
      <Button
        onClick={onSign}
        disabled={amount === 0n || !api || !selectedAccount}
      >
        Delegate{' '}
        {amount !== null &&
          planckToUnit(amount, assetInfo.precision).toLocaleString('en')}{' '}
        {assetInfo.symbol} with {convictionNo == 0 ? 0.1 : convictionNo}x
        conviction
      </Button>
    </main>
  )
}
