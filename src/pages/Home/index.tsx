import { Button } from '@/components/ui/button'

const openInNewTab = (url: string | URL | undefined) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export const Home = () => {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:mx-[5%] xl:mx-[20%] mx-0 sm:px-6 sm:py-0 md:gap-8">
      <h1 className="font-unbounded text-primary flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
        Title
      </h1>
      <div className="pageTop">
        <p>text</p>
        <Button className="mt-6" onClick={() => openInNewTab('')}>
          ClickButton
        </Button>
      </div>

      <div style={{ paddingTop: '2rem' }}></div>
    </main>
  )
}
