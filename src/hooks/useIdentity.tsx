import { useNetwork } from '@/contexts/NetworkContext'
import {
  AccountInfoIF,
  acceptedJudgement,
  notAcceptedJudgement,
} from '@/lib/utils'
import { DotPeopleQueries, IdentityJudgement } from '@polkadot-api/descriptors'
import { Binary } from 'polkadot-api'
import { useEffect, useState } from 'react'

const getJudgements = (judgements: [number, IdentityJudgement][]) => {
  judgements.forEach((j) => {
    if (acceptedJudgement.includes(j[1].type)) return true
    if (notAcceptedJudgement.includes(j[1].type)) return false
  })
  return false
}

const dataToString = (value: number | string | Binary | undefined) =>
  typeof value === 'object' ? value.asText() : (value ?? '')

const mapRawIdentity = (
  rawIdentity?: DotPeopleQueries['Identity']['IdentityOf']['Value'],
) => {
  if (!rawIdentity) return
  const {
    judgements,
    info: { display, email, legal, matrix, twitter, web },
  } = rawIdentity[0]

  const display_id = dataToString(display.value)
  return {
    display: display_id,
    web: dataToString(web.value),
    email: dataToString(email.value),
    legal: dataToString(legal.value),
    matrix: dataToString(matrix.value),
    twitter: dataToString(twitter.value),
    judgement: !!judgements.length || getJudgements(judgements),
  }
}

export const useIdentity = (address: string | undefined) => {
  const [identity, setIdentity] = useState<AccountInfoIF | undefined>()

  const { peopleApi } = useNetwork()

  useEffect(() => {
    const retrieveIdentity = async () => {
      if (!address) return
      const id = await peopleApi?.query?.Identity.IdentityOf.getValue(address)
      setIdentity({
        address,
        ...mapRawIdentity(id),
      })
    }
    retrieveIdentity()
  }, [address, peopleApi])

  return identity
}
