import { AccountInfoIF, retrieveIdentity } from '@/lib/utils'
import { BsTwitterX } from 'react-icons/bs'
import { IoCheckmarkCircle, IoMail } from 'react-icons/io5'
import { TbWorld } from 'react-icons/tb'
import { Button } from './ui/button'
import { useState, useEffect } from 'react'
import { useNetwork } from '@/contexts/NetworkContext'

interface Props {
  name: string
  address: string
}

export const IdentityInfo = ({ name, address }: Props) => {
  const { peopleApi } = useNetwork()
  const [identity, setIdentity] = useState<AccountInfoIF | undefined>()

  useEffect(() => {
    const retrieve = async () => {
      const id = await retrieveIdentity(peopleApi, address)
      setIdentity(id)
    }
    retrieve()
  }, [address, peopleApi])

  return (
    <>
      {identity?.display ? (
        <div className="flex items-center">
          {identity?.display}
          <IoCheckmarkCircle className="ml-4 text-green-500" />
        </div>
      ) : (
        name
      )}
      {identity ? (
        <div className="flex items-center justify-around text-green-500">
          {identity?.web && (
            <Button
              variant="ghost"
              onClick={() => window.open(identity?.web as string, '_blank')}
              size="icon"
            >
              <TbWorld />
            </Button>
          )}
          {identity?.twitter && (
            <Button
              variant="ghost"
              onClick={() =>
                window.open(
                  `https://twitter.com/@${identity?.twitter}`,
                  '_blank',
                )
              }
              size="icon"
            >
              <BsTwitterX />
            </Button>
          )}
          {identity?.email && (
            <Button variant="ghost" size="icon">
              <a href={`mailto:${identity?.email}`}>
                <IoMail />
              </a>
            </Button>
          )}
        </div>
      ) : null}
    </>
  )
}
