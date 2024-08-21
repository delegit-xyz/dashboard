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
import { useNavigate, useParams } from 'react-router-dom'

export const Delegate = () => {
  const { address } = useParams()
  const { getDelegateeByAddress } = useDelegatees()
  const [delegatee, setDelegatee] = useState(getDelegateeByAddress(address))
  const [amount, setAmount] = useState<number>(0)
  const [conviction, setConviction] = useState<VotingConviction>(
    VotingConviction.None,
  )
  const [convictionNo, setConvictionNo] = useState<number>(0)
  const [convictionShow, setConvictionShow] = useState<string>()
  const [convictionList, setConvictionList] = useState<Record<string, bigint>>(
    {},
  )
  const { api } = useNetwork()
  const { selectedAccount } = useAccounts()
  const navigate = useNavigate()

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

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value))
  }

  if (!api || !selectedAccount) return <div>No account found</div>

  const onSign = async () => {
    const allTracks = await api.constants.Referenda.Tracks()
      .then((tracks) => {
        return tracks.map(([track]) => track)
      })
      .catch(console.error)

    const tx = getDelegateTx({
      from: selectedAccount?.address,
      target: delegatee.address,
      conviction: conviction,
      amount: BigInt(amount),
      tracks: allTracks || [],
      api,
    })

    ;(await tx)
      .signSubmitAndWatch(selectedAccount.polkadotSigner)
      .forEach((value) => console.log('value', value))
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:mx-[5%] xl:mx-[20%] mx-0 sm:px-6 sm:py-0 md:gap-8">
      <Button className="w-20" onClick={() => navigate(`/home`)}>
        Back
      </Button>
      <div className="pageTop">
        <Label>Amount</Label>
        <Input onChange={onChangeAmount} value={amount} />
      </div>

      <Slider
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
      <Button onClick={onSign} disabled={amount === 0}>
        Delegate
      </Button>
    </main>
  )
}
