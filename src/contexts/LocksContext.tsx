import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAccounts } from './AccountsContext'
import { useNetwork } from './NetworkContext'
import {
  getLockTimes,
  indexToConviction,
  getExpectedBlockTimeMs,
} from '@/lib/utils'
import { getVoteFromNumber } from '@/lib/utils'
import {
  ConvictionVotingVoteAccountVote,
  ConvictionVotingVoteVoting,
  DotQueries,
  KsmQueries,
} from '@polkadot-api/descriptors'

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

type LocksContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

export interface ILocksContext {
  locks: VoteLock[]
}

const LocksContext = createContext<ILocksContext | undefined>(undefined)

const LocksContextProvider = ({ children }: LocksContextProps) => {
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
  const [locks, setLocks] = useState<VoteLock[]>([])

  // retrieve the tracks with locks for the selected account
  useEffect(() => {
    if (!selectedAccount || !api) {
      setLockTracks([])
      return
    }

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
    if (!selectedAccount || !api || !lockTracks.length) {
      setCurrentVoteLocks([])
      return
    }

    api.query.ConvictionVoting.VotingFor.getEntries(
      selectedAccount.address,
    ).then((res) => {
      const votes = res.map(({ keyArgs: [, trackId], value }) => ({
        trackId,
        vote: value,
      }))
      setCurrentVoteLocks(votes)
    })
  }, [api, lockTracks, lockTracks.length, selectedAccount])

  // get the ref for which we have a vote casted directly
  const refsVotedOn = useMemo(() => {
    if (!selectedAccount || !currentVoteLocks.length) return {}

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
      // we ignore delegation here
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
    ) {
      setRefRecap({})
      return
    }
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
    if (!api || !Object.entries(refRecap).length) return []

    const locks: VoteLock[] = []
    const lockTimes = await getLockTimes(api)
    const blockTimeMs = await getExpectedBlockTimeMs(api)

    Object.entries(refRecap).forEach(([id, { refInfo, vote, trackId }]) => {
      if (vote.type === 'Standard') {
        const { balance, vote: currVote } = vote.value
        const voteConviction = getVoteFromNumber(currVote)
        const convictionString = indexToConviction(voteConviction.conviction)
        const convictionLockTimeBlocks =
          lockTimes[convictionString] / blockTimeMs

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

        if (
          refInfo?.type === 'Cancelled' ||
          refInfo?.type === 'TimedOut' ||
          (refInfo?.type === 'Approved' && !voteConviction.aye) ||
          (refInfo?.type === 'Rejected' && voteConviction.aye)
        ) {
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
      } else if (vote.type === 'Split') {
        const { aye, nay } = vote.value
        const refEndBlock =
          refInfo?.type === 'Ongoing' || !refInfo
            ? BigInt(Number.MAX_SAFE_INTEGER)
            : BigInt(
                refInfo.type === 'Killed' ? refInfo.value : refInfo.value[0],
              )

        locks.push({
          isOngoing: refInfo?.type === 'Ongoing',
          endBlock: refEndBlock,
          amount: aye + nay,
          refId: Number(id),
          trackId,
        })
      } else if (vote.type === 'SplitAbstain') {
        const { abstain, aye, nay } = vote.value

        // type Ongoing and Killed are special
        // the endblock is in refInfo.value
        const refEndBlock =
          refInfo?.type === 'Ongoing' || !refInfo
            ? BigInt(Number.MAX_SAFE_INTEGER)
            : BigInt(
                refInfo.type === 'Killed' ? refInfo.value : refInfo.value[0],
              )

        locks.push({
          isOngoing: refInfo?.type === 'Ongoing',
          endBlock: refEndBlock,
          amount: aye + nay + abstain,
          refId: Number(id),
          trackId,
        })
      }
    })

    return locks
  }, [api, refRecap])

  useEffect(() => {
    getLocks().then(setLocks).catch(console.error)
  }, [getLocks])

  return (
    <LocksContext.Provider value={{ locks }}>{children}</LocksContext.Provider>
  )
}

const useLocks = () => {
  const context = useContext(LocksContext)
  if (context === undefined) {
    throw new Error('useLocks must be used within a LocksContextProvider')
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export { LocksContextProvider, useLocks }
