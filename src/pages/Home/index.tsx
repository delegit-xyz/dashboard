import { LocksCard } from '@/components/LocksCard'
import { useDelegatees } from '@/contexts/DelegateesContext'

import { DelegateeCard } from '@/components/DelegateeCard'

export const Home = () => {
  const { delegetees } = useDelegatees()

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:mx-[5%] xl:mx-[20%] mx-0 sm:px-6 sm:py-0 md:gap-8">
      <LocksCard />
      <h1 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
        Delegetees
      </h1>
      <div className="pageTop">
        {delegetees?.map((d) => <DelegateeCard delegatee={d} />)}
      </div>
    </main>
  )
}
