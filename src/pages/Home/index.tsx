import { Card } from '@/components/ui/card'
import { useDelegatees } from '@/contexts/DelegateesContext'

const openInNewTab = (url: string | URL | undefined) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export const Home = () => {
  const { delegetees } = useDelegatees()

  console.log(delegetees)
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:mx-[5%] xl:mx-[20%] mx-0 sm:px-6 sm:py-0 md:gap-8">
      <h1 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
        Delegetees
      </h1>
      <div className="pageTop">
        {delegetees?.map((d) => (
          <Card className="border-2 flex flex-col p-2 mb-5">
            <div className="flex columns-3">
              <div className="p-2 w-[10%]">
                <img className="rounded-3xl" width="100" src={d.image} />
              </div>
              <div className="p-2 w-[85%]">
                <div className="font-bold">{d.name}</div>
                <div className="">{d.shortDescription}</div>
              </div>
            </div>
            <div className="w-full">Other info</div>
          </Card>
        ))}
      </div>
    </main>
  )
}
