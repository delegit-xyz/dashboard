import { useAccounts } from '@/contexts/AccountsContext'
import { useNetwork } from '@/contexts/NetworkContext'
import {
  ConvictionVotingVoteAccountVote,
  ConvictionVotingVoteVoting,
} from '@polkadot-api/descriptors'
import { useEffect, useState } from 'react'

export const useGetLocks = () => {
  const { selectedAccount } = useAccounts()
  const { api } = useNetwork()

  const [lockTracks, setLockTracks] = useState<number[]>([])
  const [currentVotes, setCurrentVotes] = useState<
    ConvictionVotingVoteVoting[]
  >([])
  const [refsVotedOn, setRefsVotedOn] = useState<
    [number, ConvictionVotingVoteAccountVote][]
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

  useEffect(() => {
    if (!selectedAccount || !api || !lockTracks.length) return

    api.query.ConvictionVoting.VotingFor.getEntries(
      selectedAccount.address,
    ).then((res) => {
      const votes = res.map(({ value }) => value)
      setCurrentVotes(votes)
      console.log('votes', votes)
    })

    //     const params = lockTracks.map((id) => [selectedAccount.address, id]) as [
    //       SS58String,
    //       number,
    //     ][]

    //     api.query.ConvictionVoting.VotingFor.getValues(params)
    //       .then(setCurrentVotes)
    //       .catch(console.error)
  }, [api, lockTracks, lockTracks.length, selectedAccount])

  useEffect(() => {
    if (!selectedAccount || !api || !currentVotes.length) return

    const res = currentVotes
      // filter for all the directly casted votes
      .filter((res) => res.type == 'Casting' && 'votes' in res.value)
      .map(({ type, value }) => {
        if (type == 'Casting') {
          return value.votes[0]
        }
      })
      // remove potentially undefined values
      .filter((val) => !!val)

    setRefsVotedOn(res)
  }, [api, currentVotes, currentVotes.length, selectedAccount])

  console.log('refsVotedOn', refsVotedOn)
  return { lockTracks, currentVotes }

  //   // retrieve the specific votes casted over the classes & address
  //   const voteParams = useMemo(
  //     () => getVoteParams(address, lockClasses),
  //     [address, lockClasses]
  //   );

  //   const votes = useCall<[BN, BN[], PalletConvictionVotingVoteCasting][] | undefined>(voteParams && api.query[palletVote]?.votingFor.multi, voteParams, OPT_VOTES);

  //   // retrieve the referendums that were voted on
  //   const refParams = useMemo(
  //     () => getRefParams(votes),
  //     [votes]
  //   );

  //   const referenda = useCall(refParams && api.query[palletReferenda]?.referendumInfoFor.multi, refParams, OPT_REFS);

  //   // combine the referenda outcomes and the votes into locks
  //   return useMemo(
  //     () => votes && referenda && getLocks(api, palletVote, votes, referenda),
  //     [api, palletVote, referenda, votes]
  //   );
}
