import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDelegates } from '@/contexts/DelegatesContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { getLockTimes } from '@/lib/utils'
import { VotingConviction } from '@polkadot-api/descriptors'
import { SetStateAction, useEffect, useState } from 'react'
import { convertMiliseconds } from '@/lib/convertMiliseconds'
import { Button } from '@/components/ui/button'
import { getDelegateTx } from '@/lib/currentVotesAndDelegations'
import { useAccounts } from '@/contexts/AccountsContext'
import { Slider } from '@/components/ui/slider'
import { useParams } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { msgs } from '@/lib/constants'
import { evalUnits, planckToUnit } from '@polkadot-ui/utils'

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

  const { getDelegateByAddress } = useDelegates()
  const [delegate, setDelegate] = useState(
    address && getDelegateByAddress(address),
  )
  const [amount, setAmount] = useState<bigint>(0n)
  const [amountVisible, setAmountVisible] = useState<string>('0')
  const [amountError, setAmountError] = useState<string>('')
  const [conviction, setConviction] = useState<VotingConviction>(
    VotingConviction.None,
  )
  const [convictionNo, setConvictionNo] = useState<number>(0)
  const [convictionShow, setConvictionShow] = useState<string>()
  const [convictionList, setConvictionList] = useState<Record<string, bigint>>(
    {},
  )
  const { selectedAccount } = useAccounts()

  useEffect(() => {
    // API change denotes that the netowork changed. Due to the fact that
    // decimals of network may change as well we should conver the amount to 0n
    // in order to make sure that correct number will be used.
    setAmount(0n)
    setAmountVisible('0')
  }, [api])

  useEffect(() => {
    if (!api) return
    getLockTimes(api).then(setConvictionList).catch(console.error)
  }, [address, api])

  useEffect(() => {
    Object.entries(convictionList).filter((a, i) => {
      if (i === convictionNo) {
        setConvictionShow(
          `${a[0]} - ${convertMiliseconds(Number(a[1])).d} days`,
        )
      }
    })
  }, [convictionNo, convictionList])

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
    setAmountError('')
    const [bnResult, errorMessage] = evalUnits(e.target.value, decimals)
    setAmount(bnResult || 0n)
    errorMessage && setAmountError(errorMessage)
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
    <main className="mx-0 grid flex-1 items-start gap-4 p-4 sm:mx-[5%] sm:px-6 sm:py-0 md:gap-8 xl:mx-[20%]">
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
      <h1 className="flex-1 shrink-0 whitespace-nowrap font-unbounded text-xl font-semibold tracking-tight text-primary sm:grow-0">
        Delegate to {delegate.name}
      </h1>
      <div className="pageTop">
        <Label>Amount</Label>
        <Input
          onChange={(value) => onChangeAmount(value, assetInfo.precision)}
          value={amountVisible}
        />
      </div>

      {amountError ? (
        <AlertNote
          title={'Input Error'}
          message={amountError}
          variant="destructive"
        />
      ) : (
        amount === 0n && (
          <AlertNote
            title={msgs.zeroAmount.title}
            message={msgs.zeroAmount.message}
            variant="default"
          />
        )
      )}

      <Slider
        disabled={!api || !selectedAccount}
        defaultValue={[0]}
        min={0}
        max={6}
        step={1}
        className={'w-[100%]'}
        onValueChange={(v: SetStateAction<number>[]) => {
          const value = v[0] === 0 ? 'None' : `Locked${v[0]}x`
          setConvictionNo(v[0])
          setConviction(
            VotingConviction[value as keyof typeof VotingConviction],
          )
        }}
      />
      <Label className="flex">
        Conviction:<div className="ml-2">{convictionShow}</div>
      </Label>
      <Button
        onClick={onSign}
        disabled={amount === 0n || !api || !selectedAccount}
      >
        Delegate{' '}
        {amount !== null &&
          planckToUnit(amount, assetInfo.precision).toLocaleString('en')}{' '}
        {assetInfo.symbol} with {convictionNo}x conviction.
      </Button>
    </main>
  )
}
