import { LocksCard } from '@/components/LocksCard'
import { useDelegates } from '@/contexts/DelegatesContext'
import { DelegateCard } from '@/components/DelegateCard'

export const Home = () => {
  const { delegates } = useDelegates()

  return (
    <main className="mx-0 grid flex-1 items-start gap-4 p-4 sm:mx-[5%] sm:px-6 sm:py-0 md:gap-8 xl:mx-[20%]">
      <LocksCard />
      <h1 className="flex-1 shrink-0 whitespace-nowrap font-unbounded text-xl font-semibold tracking-tight text-primary sm:grow-0">
        Delegates
      </h1>
      <div className="pageTop">
        {delegates?.map((d) => <DelegateCard delegate={d} />)}
      </div>
    </main>
  )
}
