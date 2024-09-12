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
  VotingConviction,
} from '@polkadot-api/descriptors'
import {
  convertMiliseconds,
  displayRemainingTime,
} from '@/lib/convertMiliseconds'

// eslint-disable-next-line react-refresh/only-export-components
export enum LockType {
  'Casting',
  'Delegating',
}
export interface VoteLock {
  type: LockType.Casting
  isOngoing: boolean
  refId: number
  endBlock: bigint
  amount: bigint
  trackId: number
}

export interface CurrentDelegation {
  balance: bigint
  conviction: VotingConviction
  trackId: number
}

export interface DelegationLock {
  type: LockType.Delegating
  amount: bigint
  endBlock: number
  trackId: number
}

export type CastedVotes = Record<
  number,
  {
    refInfo?: RefInfo
    trackId: number
    vote: ConvictionVotingVoteAccountVote
  }
>

type RefInfo =
  | DotQueries['Referenda']['ReferendumInfoFor']['Value']
  | KsmQueries['Referenda']['ReferendumInfoFor']['Value']

type StateOfRefs = Record<
  number,
  { refInfo?: RefInfo; vote: ConvictionVotingVoteAccountVote; trackId: number }
>

type LocksContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

export interface ConvictionDisplay {
  multiplier?: number
  display?: string
}

export interface ILocksContext {
  voteLocks: VoteLock[]
  delegations?: Record<string, CurrentDelegation[]>
  delegationLocks: DelegationLock[]
  getConvictionLockTimeDisplay: (
    conviction: number | string,
  ) => ConvictionDisplay
  refreshLocks: () => void
}

const LocksContext = createContext<ILocksContext | undefined>(undefined)

const LocksContextProvider = ({ children }: LocksContextProps) => {
  const { selectedAccount } = useAccounts()
  const { api } = useNetwork()

  const [forcerefresh, setForceRefresh] = useState(0)
  const [lockTracks, setLockTracks] = useState<number[]>([])
  const [stateOfRefs, setStateOfRefs] = useState<StateOfRefs>({})
  const [currentVoteLocks, setCurrentVoteLocks] = useState<
    {
      trackId: number
      vote: NonNullable<ConvictionVotingVoteVoting>
    }[]
  >([])
  const [voteLocks, setVoteLocks] = useState<VoteLock[]>([])
  const [convictionLocksMap, setConvictionLocksMap] = useState<
    Record<string, bigint>
  >({})

  const refreshLocks = useCallback(() => {
    setForceRefresh((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (!api) return

    getLockTimes(api).then(setConvictionLocksMap).catch(console.error)
  }, [api])

  // retrieve the tracks with locks for the selected account
  useEffect(() => {
    if (!selectedAccount || !api) {
      setLockTracks([])
      return
    }

    const sub = api.query.ConvictionVoting.ClassLocksFor.watchValue(
      selectedAccount.address,
      'best',
    ).subscribe((value) => {
      const trackIdArray = value.map(([trackId]) => trackId)
      setLockTracks(trackIdArray)
    })

    return () => sub.unsubscribe()
  }, [api, selectedAccount])

  // retrieve all the votes for the selected account
  // they can be directly casted or delegated
  // there's a forcerefresh in the dependancies array
  // bc the lockTracks doesn't change when the delegation changes
  useEffect(() => {
    if (!selectedAccount || !api || !lockTracks.length) {
      setCurrentVoteLocks([])
      return
    }

    const controller = new AbortController()

    api.query.ConvictionVoting.VotingFor.getEntries(selectedAccount.address, {
      at: 'best',
      signal: controller.signal,
    }).then((res) => {
      const votes = res.map(({ keyArgs: [, trackId], value }) => ({
        trackId,
        vote: value,
      }))
      setCurrentVoteLocks(votes)
    })

    return () => controller.abort()
  }, [api, lockTracks, lockTracks.length, selectedAccount, forcerefresh])

  // get the ref for which we have a vote casted directly
  // or for which we have delegated
  const { delegations, castedVotes, delegationLocks } = useMemo(() => {
    if (!selectedAccount || !currentVoteLocks.length)
      return { castedVotes: {}, delegations: {}, delegationLocks: [] }

    const castedVotes: CastedVotes = {}
    const delegations: ILocksContext['delegations'] = {}
    const delegationLocks: ILocksContext['delegationLocks'] = []

    currentVoteLocks.forEach(({ trackId, vote: { type, value } }) => {
      // when the account is currently delegating
      // when it undelegated, this will have the type Casting
      if (type === 'Delegating') {
        const prev = delegations[value.target] || []

        delegations[value.target] = [
          ...prev,
          {
            trackId,
            balance: value.balance,
            conviction: value.conviction,
          },
        ]
      } else if (type === 'Casting') {
        // this is when the account has casted a vote directly
        // or it's undelegating in which `votes` is empty
        // so here it's only for actually casted votes
        value.votes.forEach(([refId, vote]) => {
          castedVotes[refId] = {
            trackId,
            vote,
          }
        })

        // this is when the account is undelegating
        if (value.prior[1] > 0) {
          delegationLocks.push({
            type: LockType.Delegating,
            trackId,
            amount: value.prior[1],
            endBlock: value.prior[0],
          })
        }
      }
    })

    return { castedVotes, delegations, delegationLocks }
  }, [currentVoteLocks, selectedAccount])

  useEffect(() => {
    if (
      !selectedAccount ||
      !api ||
      !castedVotes ||
      !Object.entries(castedVotes).length
    ) {
      setStateOfRefs({})
      return
    }
    const refParams = Object.keys(castedVotes).map((id) => [Number(id)]) as [
      number,
    ][]

    const tempRefs: StateOfRefs = castedVotes
    const controller = new AbortController()

    api.query.Referenda.ReferendumInfoFor.getValues(refParams, {
      at: 'best',
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.values) return

        const definedRefInfo = res.filter((r) => !!r)

        Object.keys(castedVotes).forEach((id, index) => {
          if (!res[index]?.value) return
          tempRefs[Number(id)].refInfo = definedRefInfo[index]
        })

        setStateOfRefs(tempRefs)
      })
      .catch(console.error)

    return () => controller.abort()
  }, [api, castedVotes, selectedAccount])

  const getLocks = useCallback(async () => {
    if (!api || !Object.entries(stateOfRefs).length) return []

    const locks: VoteLock[] = []
    const lockTimes = await getLockTimes(api)
    const blockTimeMs = await getExpectedBlockTimeMs(api)

    Object.entries(stateOfRefs).forEach(([id, { refInfo, vote, trackId }]) => {
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
            type: LockType.Casting,
            isOngoing: false,
            endBlock: refEndBlock + convictionLockTimeBlocks,
            amount: balance,
            refId: Number(id),
            trackId,
          })
        }

        // in case the lock period is 0
        if (
          refInfo?.type === 'Cancelled' ||
          refInfo?.type === 'TimedOut' ||
          (refInfo?.type === 'Approved' && !voteConviction.aye) ||
          (refInfo?.type === 'Rejected' && voteConviction.aye)
        ) {
          const refEndBlock = BigInt(refInfo.value[0])

          locks.push({
            type: LockType.Casting,
            isOngoing: false,
            endBlock: refEndBlock,
            amount: balance,
            refId: Number(id),
            trackId,
          })
        }

        // when killed the lock period is 0
        // but the info is in value instead of value[0]
        if (refInfo?.type === 'Killed') {
          const refEndBlock = BigInt(refInfo.value)

          locks.push({
            type: LockType.Casting,
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
            type: LockType.Casting,
            isOngoing: true,
            endBlock: refEndBlock,
            amount: balance,
            refId: Number(id),
            trackId,
          })
        }
      } else if (vote.type === 'Split' || vote.type === 'SplitAbstain') {
        let amount: bigint
        if (vote.type === 'Split') {
          amount = vote.value.aye + vote.value.nay
        } else {
          amount = vote.value.abstain + vote.value.aye + vote.value.nay
        }

        let refEndBlock: bigint

        if (!refInfo || refInfo.type === 'Ongoing') {
          refEndBlock = BigInt(Number.MAX_SAFE_INTEGER)
        } else if (refInfo.type === 'Killed') {
          refEndBlock = BigInt(refInfo.value)
        } else {
          // for Canceled, Timeout, Approved, Rejected
          // the endblock time is in refInfo.value[0]
          refEndBlock = BigInt(refInfo.value[0])
        }

        locks.push({
          type: LockType.Casting,
          isOngoing: refInfo?.type === 'Ongoing',
          endBlock: refEndBlock,
          amount,
          refId: Number(id),
          trackId,
        })
      }
    })

    return locks
  }, [api, stateOfRefs])

  useEffect(() => {
    getLocks().then(setVoteLocks).catch(console.error)
  }, [getLocks])

  /**
   * Returns an object containing the display text and multiplier for a given conviction lock time.
   *
   * @param {number|string} conviction - The conviction value, either a number or a string (e.g. 'Locked3x', 'None')
   * @returns {object} An object with two properties: `multiplier` (number) and `display` (string) in days or 'no lock'
   */
  const getConvictionLockTimeDisplay = useCallback(
    (conviction: number | string): ConvictionDisplay => {
      if (Object.entries(convictionLocksMap).length === 0) {
        return {}
      }

      if (typeof conviction === 'string') {
        if (conviction === 'None') {
          return {
            multiplier: 0.1,
            display: 'no lock',
          }
        }

        return {
          multiplier: Number(conviction.replace('Locked', '').replace('x', '')),
          display: `${displayRemainingTime(convertMiliseconds(Number(convictionLocksMap[conviction])))} lock`,
        }
      } else {
        if (conviction === 0) {
          return { multiplier: 0.1, display: 'no lock' }
        }
        const key = `Locked${conviction}x`
        return {
          multiplier: conviction,
          display: `${displayRemainingTime(convertMiliseconds(Number(convictionLocksMap[key])))} lock`,
        }
      }
    },
    [convictionLocksMap],
  )

  return (
    <LocksContext.Provider
      value={{
        voteLocks,
        delegations,
        getConvictionLockTimeDisplay,
        delegationLocks,
        refreshLocks,
      }}
    >
      {children}
    </LocksContext.Provider>
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
