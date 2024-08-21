import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDelegatees } from '@/contexts/DelegateesContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { getLockTimes } from '@/lib/locks'
import { VotingConviction } from '@polkadot-api/descriptors'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { convertMiliseconds } from '@/lib/convertMiliseconds'
import { Button } from '@/components/ui/button'
import { getDelegateTx } from '@/lib/currentVotesAndDelegations'
import { useAccounts } from '@/contexts/AccountsContext'

export const Delegate = () => {
  const { address } = useParams()
  const { getDelegateeByAddress } = useDelegatees()
  const [delegatee, setDelegatee] = useState(getDelegateeByAddress(address))
  const [amount, setAmount] = useState(0)
  const [conviction, setConviction] = useState<VotingConviction>(
    VotingConviction.None,
  )
  const [convictionList, setConvictionList] = useState<Record<string, bigint>>(
    {},
  )
  const { api } = useNetwork()
  const { selectedAccount } = useAccounts()

  console.log('conviction', conviction)
  useEffect(() => {
    if (!api) return
    getLockTimes(api).then(setConvictionList).catch(console.error)
  }, [api])

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
      <h1 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
        Delegate to {delegatee.name}
      </h1>
      <div className="pageTop">
        <Label>Amount</Label>
        <Input onChange={onChangeAmount} value={amount} />
      </div>
      <Label>Conviction</Label>
      <select
        onChange={(e) =>
          setConviction(
            VotingConviction[e.target.value as keyof typeof VotingConviction],
          )
        }
      >
        {Object.entries(convictionList).map(([label, timeLock]) => {
          return (
            <option value={label}>
              {label} - {convertMiliseconds(Number(timeLock)).d} days
            </option>
          )
        })}
      </select>
      <Button onClick={onSign}>Delegate</Button>
    </main>
  )
}
