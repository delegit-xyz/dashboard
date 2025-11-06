import { useNetwork } from '@/contexts/NetworkContext'
import { AccountInfoIF, acceptedJudgement } from '@/lib/utils'
import { DotPeopleQueries, IdentityJudgement } from '@polkadot-api/descriptors'
import { Binary } from 'polkadot-api'
import { useEffect, useState } from 'react'

const getJudgements = (judgements: [number, IdentityJudgement][]) =>
  judgements.some(([, j]) => acceptedJudgement.includes(j.type))

const dataToString = (value: number | string | Binary | undefined) =>
  typeof value === 'object' ? value.asText() : (value ?? '')

const mapRawIdentity = (
  rawIdentity?: DotPeopleQueries['Identity']['IdentityOf']['Value'],
) => {
  if (!rawIdentity) return

  let item
  if (Array.isArray(rawIdentity)) {
    item = rawIdentity[0]
  } else {
    return
  }

  const {
    judgements,
    info: { display, email, legal, matrix, twitter, web },
  } = item

  const display_id = dataToString(display.value)
  return {
    display: display_id,
    web: dataToString(web.value),
    email: dataToString(email.value),
    legal: dataToString(legal.value),
    matrix: dataToString(matrix.value),
    twitter: dataToString(twitter.value),
    judgement: getJudgements(judgements),
  }
}

export const useIdentity = (address: string | undefined) => {
  const [identity, setIdentity] = useState<AccountInfoIF | undefined>()

  const { peopleApi } = useNetwork()

  useEffect(() => {
    if (!address || !peopleApi) return

    peopleApi.query.Identity.IdentityOf.getValue(address)
      .then((id) => {
        setIdentity({
          address,
          ...mapRawIdentity(id),
        })
      })
      .catch(console.error)
  }, [address, peopleApi])

  return identity
}
