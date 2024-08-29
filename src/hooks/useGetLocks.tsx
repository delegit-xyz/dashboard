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
  trackId: number
}

type RefInfo =
  | DotQueries['Referenda']['ReferendumInfoFor']['Value']
  | KsmQueries['Referenda']['ReferendumInfoFor']['Value']
type RefRecap = Record<
  number,
  { refInfo?: RefInfo; vote: ConvictionVotingVoteAccountVote; trackId: number }
>

export const useGetLocks = () => {
  const { selectedAccount } = useAccounts()
  const { api } = useNetwork()

  const [lockTracks, setLockTracks] = useState<number[]>([])
  const [refRecap, setRefRecap] = useState<RefRecap>({})
  const [currentVoteLocks, setCurrentVoteLocks] = useState<
    {
      trackId: number
      vote: NonNullable<ConvictionVotingVoteVoting>
    }[]
  >([])

  // retrieve the tracks with locks for the selected account
  useEffect(() => {
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
      const votes = res.map(({ keyArgs: [, trackId], value }) => ({
        trackId,
        vote: value,
      }))
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
    if (!selectedAccount || !currentVoteLocks.length) return

    const res: Record<
      number,
      {
        refInfo?: RefInfo
        trackId: number
        vote: ConvictionVotingVoteAccountVote
      }
    > = {}

    currentVoteLocks
      // filter for all the directly casted votes
      .filter(({ vote }) => vote.type == 'Casting' && 'votes' in vote.value)
      .forEach(({ trackId, vote: { type, value } }) => {
        if (type === 'Casting') {
          value.votes.forEach(([refId, vote]) => {
            res[refId] = {
              trackId,
              vote,
            }
          })
        }
      })

    return res
  }, [currentVoteLocks, selectedAccount])

  useEffect(() => {
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

        Object.keys(refsVotedOn).forEach((id, index) => {
          if (!res[index]?.value) return
          tempRefs[Number(id)].refInfo = definedRefInfo[index]
        })

        setRefRecap(tempRefs)
      })
      .catch(console.error)
  }, [api, refsVotedOn, selectedAccount])

  const getLocks = useCallback(async () => {
    if (!api || !refRecap) return
    const locks: VoteLock[] = []
    const lockTimes = await getLockTimes(api)
    const blockTimeMs = await getExpectedBlockTimeMs(api)

    Object.entries(refRecap).forEach(([id, { refInfo, vote, trackId }]) => {
      // let total = 0n
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
          const refEndBlock = BigInt(refInfo.value[0])

          locks.push({
            isOngoing: false,
            endBlock: refEndBlock + convictionLockTimeBlocks,
            amount: balance,
            refId: Number(id),
            trackId,
          })
        }

        if (refInfo?.type === 'Cancelled' || refInfo?.type === 'TimedOut') {
          const refEndBlock = BigInt(refInfo.value[0])

          locks.push({
            isOngoing: false,
            endBlock: refEndBlock,
            amount: balance,
            refId: Number(id),
            trackId,
          })
        }

        if (refInfo?.type === 'Killed') {
          const refEndBlock = BigInt(refInfo.value)

          locks.push({
            isOngoing: false,
            endBlock: refEndBlock,
            amount: balance,
            refId: Number(id),
            trackId,
          })
        }

        if (refInfo?.type === 'Ongoing') {
          const refEndBlock = BigInt(Number.MAX_SAFE_INTEGER)

          locks.push({
            isOngoing: true,
            endBlock: refEndBlock,
            amount: balance,
            refId: Number(id),
            trackId,
          })
        }

        // total = balance
      } else if (vote.type === 'Split') {
        //
      } else if (vote.type === 'SplitAbstain') {
        //
      }
    })

    return locks
  }, [api, refRecap])

  return { lockTracks, currentVoteLocks, refsVotedOn, getLocks }
}
