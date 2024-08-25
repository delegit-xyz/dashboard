import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDelegatees } from '@/contexts/DelegateesContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { getLockTimes } from '@/lib/locks'
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
import { msgs } from '@/consts'
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
  const { address } = useParams()
  const { getDelegateeByAddress } = useDelegatees()
  const [delegatee, setDelegatee] = useState(getDelegateeByAddress(address))
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
  const { api, chainInfo } = useNetwork()
  const { selectedAccount } = useAccounts()

  useEffect(() => {
    if (!api) return
    getLockTimes(api).then(setConvictionList).catch(console.error)
  }, [api])

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
    if (delegatee) return

    setDelegatee(getDelegateeByAddress(address))
  }, [address, delegatee, getDelegateeByAddress])

  if (!delegatee || !api) return <div>No delegatee found</div>

  const onChangeAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
    decimals: number,
  ) => {
    setAmountError('')
    const res = evalUnits(e.target.value, decimals)
    console.log('e.target.value', res[0], res[1])
    if (res[0] === null) {
      res[0] = 0n
      setAmountError(res[1])
    }
    setAmount(res[0])
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
        target: delegatee.address,
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
    <main className="grid flex-1 items-start gap-4 p-4 sm:mx-[5%] xl:mx-[20%] mx-0 sm:px-6 sm:py-0 md:gap-8">
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
      <h1 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
        Delegate to {delegatee.name}
      </h1>
      <div className="pageTop">
        <Label>Amount</Label>
        <Input
          onChange={(value) => onChangeAmount(value, chainInfo.chainDecimals)}
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
          planckToUnit(amount, chainInfo.chainDecimals).toLocaleString(
            'en',
          )}{' '}
        {chainInfo.symbol}
      </Button>
    </main>
  )
}
