import { LocksCard } from '@/components/LocksCard'
import { useDelegates } from '@/contexts/DelegatesContext'
import { DelegateCard } from '@/components/DelegateCard'
import { Title } from '@/components/ui/title'
import { MyDelegations } from '@/components/MyDelegations'
import { DelegateSearch } from '@/components/DelegateSearch'
import { useState } from 'react'

export const Home = () => {
  const { delegates } = useDelegates()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDelegates = delegates?.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <main className="m-auto w-full max-w-4xl p-4 sm:px-6 sm:py-0 md:gap-8">
      <LocksCard />
      <MyDelegations />
      <DelegateSearch delegateValue={searchTerm} onSearch={setSearchTerm} />
      <Title>Delegates</Title>
      <div className="sm:grid sm:grid-cols-1">
        {filteredDelegates?.map((d) => (
          <DelegateCard key={d.address} delegate={d} className="mb-5" />
        ))}
      </div>
    </main>
  )
}
