import { LocksCard } from '@/components/LocksCard'
import { useDelegates } from '@/contexts/DelegatesContext'
import { DelegateCard } from '@/components/DelegateCard'
import { Title } from '@/components/ui/title'
import { MyDelegations } from '@/components/MyDelegations'

export const Home = () => {
  const { delegates } = useDelegates()

  return (
    <main className="mx-0 grid flex-1 items-start gap-4 p-4 sm:mx-[5%] sm:px-6 sm:py-0 md:gap-8 xl:mx-[20%]">
      <LocksCard />
      <MyDelegations />
      <Title>Delegates</Title>
      <div className="pageTop">
        {delegates?.map((d) => <DelegateCard key={d.address} delegate={d} />)}
      </div>
    </main>
  )
}
