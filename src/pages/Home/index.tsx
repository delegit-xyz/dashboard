import { LocksCard } from '@/components/LocksCard'
import { useDelegates } from '@/contexts/DelegatesContext'
import { DelegateCard } from '@/components/DelegateCard'
import { Title } from '@/components/ui/title'
import { MyDelegations } from '@/components/MyDelegations'

export const Home = () => {
  const { delegates } = useDelegates()

  return (
    <main className="m-auto w-full max-w-4xl p-4 sm:px-6 sm:py-0 md:gap-8">
      <LocksCard />
      <MyDelegations />
      <Title>Delegates</Title>
      <div className="sm:grid sm:grid-cols-1">
        {delegates?.map((d) => (
          <DelegateCard key={d.address} delegate={d} className="mb-5" />
        ))}
      </div>
    </main>
  )
}
