import { LocksCard } from '@/components/LocksCard'
import { useDelegates } from '@/contexts/DelegatesContext'
import { DelegateCard } from '@/components/DelegateCard'
import { Title } from '@/components/ui/title'
import { MyDelegations } from '@/components/MyDelegations'
import { DelegateSearch } from '@/components/DelegateSearch'
import { DelegateSearchButton } from '@/components/DelegateSearchButton'
import { useState } from 'react'

export const Home = () => {
  const { delegates } = useDelegates()
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const filteredDelegates = delegates?.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.address.toLowerCase().startsWith(searchTerm.toLowerCase()),
  )

  return (
    <main className="m-auto w-full max-w-4xl p-4 sm:px-6 sm:py-0 md:gap-8">
      <LocksCard />
      <MyDelegations />
      {showSearch && (
        <DelegateSearch delegateValue={searchTerm} onSearch={setSearchTerm} />
      )}
      <div className="flex items-baseline justify-between">
        <Title>Delegates</Title>
        <DelegateSearchButton
          onClick={() => setShowSearch(!showSearch)}
          isVisible={showSearch}
        />
      </div>

      <div className="sm:grid sm:grid-cols-1">
        {filteredDelegates?.length === 0 ? (
          <div className="mt-2 text-center text-2xl">
            No Delegates were found. Please reset your search.
          </div>
        ) : (
          filteredDelegates?.map((d) => (
            <DelegateCard key={d.address} delegate={d} className="mb-5" />
          ))
        )}
      </div>
    </main>
  )
}
