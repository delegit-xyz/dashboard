import { useAccounts } from '@/contexts/AccountsContext'
import { useNetwork } from '@/contexts/NetworkContext'
import {
  getLockTimes,
  indexToConviction,
  getExpectedBlockTimeMs,
} from '@/lib/locks'
import { getVoteFromNumber } from '@/lib/utils'
import {
  ConvictionVotingVoteAccountVote,
  ConvictionVotingVoteVoting,
  DotQueries,
  KsmQueries,
} from '@polkadot-api/descriptors'

import { useCallback, useEffect, useMemo, useState } from 'react'

export interface VoteLock {
  isOngoing: boolean
  refId: number
  endBlock: bigint
  amount: bigint
}

type RefInfo =
  | DotQueries['Referenda']['ReferendumInfoFor']['Value']
  | KsmQueries['Referenda']['ReferendumInfoFor']['Value']
type RefRecap = Record<
  number,
  { refInfo?: RefInfo; vote: ConvictionVotingVoteAccountVote }
>

export const useGetLocks = () => {
  const { selectedAccount } = useAccounts()
  const { api } = useNetwork()

  const [lockTracks, setLockTracks] = useState<number[]>([])
  const [refRecap, setRefRecap] = useState<RefRecap>({})
  const [currentVoteLocks, setCurrentVoteLocks] = useState<
    ConvictionVotingVoteVoting[]
  >([])

  // const [refInfo, setRefInfo] = useState<RefInfo[]>([])

  // retrieve the tracks with locks for the selected account
  useEffect(() => {
    console.log('go 3')

    if (!selectedAccount || !api) return

    const sub = api.query.ConvictionVoting.ClassLocksFor.watchValue(
      selectedAccount.address,
    ).subscribe((value) => {
      const trackIdArray = value.map(([trackId]) => trackId)
      setLockTracks(trackIdArray)
    })

    return () => sub.unsubscribe()
  }, [api, selectedAccount])

  // retrieve all the votes for the selected account
  // they can be directly casted or delegated
  useEffect(() => {
    if (!selectedAccount || !api || !lockTracks.length) return

    api.query.ConvictionVoting.VotingFor.getEntries(
      selectedAccount.address,
    ).then((res) => {
      const votes = res.map(({ value }) => value)
      setCurrentVoteLocks(votes)
    })

    //     const params = lockTracks.map((id) => [selectedAccount.address, id]) as [
    //       SS58String,
    //       number,
    //     ][]

    //     api.query.ConvictionVoting.VotingFor.getValues(params)
    //       .then(setCurrentVotes)
    //       .catch(console.error)
  }, [api, lockTracks, lockTracks.length, selectedAccount])

  // get the ref for which we have a vote casted directly
  const refsVotedOn = useMemo(() => {
    console.log('memo 1')

    if (!selectedAccount || !currentVoteLocks.length) return

    const res: Record<
      number,
      { refInfo?: RefInfo; vote: ConvictionVotingVoteAccountVote }
    > = {}

    currentVoteLocks
      // filter for all the directly casted votes
      .filter((res) => res.type == 'Casting' && 'votes' in res.value)
      .forEach(({ type, value }) => {
        if (type === 'Casting') {
          value.votes.forEach(([refId, vote]) => {
            res[refId] = { vote }
          })
        }
      })

    return res
  }, [currentVoteLocks, selectedAccount])

  useEffect(() => {
    console.log('go 2')

    if (
      !selectedAccount ||
      !api ||
      !refsVotedOn ||
      !Object.entries(refsVotedOn).length
    )
      return

    const refParams = Object.keys(refsVotedOn).map((id) => [Number(id)]) as [
      number,
    ][]

    const tempRefs = refsVotedOn
    api.query.Referenda.ReferendumInfoFor.getValues(refParams)
      .then((res) => {
        if (!res.values) return

        const definedRefInfo = res.filter((r) => !!r)

        // setRefInfo(definedRefInfo)
        Object.keys(refsVotedOn).forEach((id, index) => {
          if (!res[index]?.value) return
          tempRefs[Number(id)].refInfo = definedRefInfo[index]
        })

        setRefRecap(tempRefs)
      })
      .catch(console.error)
  }, [api, refsVotedOn, selectedAccount])

  const getLocks = useCallback(async () => {
    console.log('go 1')

    if (!api || !refRecap) return
    const locks: VoteLock[] = []
    const lockTimes = await getLockTimes(api)
    const blockTimeMs = await getExpectedBlockTimeMs(api)

    Object.entries(refRecap).forEach(([id, { refInfo, vote }]) => {
      let total = 0n
      if (vote.type === 'Standard') {
        const { balance, vote: currVote } = vote.value
        const voteConviction = getVoteFromNumber(currVote)
        const convictionString = indexToConviction(voteConviction.conviction)
        const convictionLockTimeBlocks =
          lockTimes[convictionString] / blockTimeMs
        // console.log('-----> lockTimes', lockTimes[convictionString])
        // console.log('-----> voteConviction', voteConviction, convictionString)

        if (
          (refInfo?.type === 'Approved' && voteConviction.aye) ||
          (refInfo?.type === 'Rejected' && !voteConviction.aye)
        ) {
          // endBlock = lockPeriod
          // .muln(convictionIndex ? CONVICTIONS[convictionIndex - 1][durationIndex] : 0)
          // .add(
          //   tally.isApproved
          //     ? tally.asApproved[0]
          //     : tally.asRejected[0]
          // );

          const refEndBlock = BigInt(refInfo.value[0])

          locks.push({
            isOngoing: false,
            endBlock: refEndBlock + convictionLockTimeBlocks,
            amount: balance,
            refId: Number(id),
          })
        }
        total = balance
      } else if (vote.type === 'Split') {
        //
      } else if (vote.type === 'SplitAbstain') {
        //
      }
    })

    return locks
  }, [api, refRecap])
  //   for (const ref of refsVotedOn) {
  //     console.log('ref', ref)
  //   }
  //   console.log('currentVoteLocks', currentVoteLocks)

  return { lockTracks, currentVoteLocks, refsVotedOn, getLocks }

  //   // combine the referenda outcomes and the votes into locks
  //   return useMemo(
  //     () => votes && referenda && getLocks(api, palletVote, votes, referenda),
  //     [api, palletVote, referenda, votes]
  //   );
}
