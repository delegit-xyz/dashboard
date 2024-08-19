import { Route, Routes } from 'react-router-dom'

import { About } from '@/pages/About'

import { useEffect, useState } from 'react'
import { collectiveClient } from './clients'
import { toast } from 'sonner'

const pages = (lcStatus: boolean) => [
  {
    path: '',
    element: <About lcStatus={lcStatus} />,
  },
]

export const Content = () => {
  const [lightClientLoaded, setLightClientLoaded] = useState<boolean>(false)

  useEffect(() => {
    collectiveClient.finalizedBlock$.subscribe((finalizedBlock) => {
      if (finalizedBlock.number && !lightClientLoaded) {
        setLightClientLoaded(true)
      }
    })
  }, [lightClientLoaded])

  useEffect(() => {
    lightClientLoaded && toast.success('Light client: Synced')
  }, [lightClientLoaded])

  return (
    <>
      <Routes>
        {pages(lightClientLoaded).map(({ path, element }, i) => {
          return <Route key={`page_${i}`} path={path} element={element} />
        })}
      </Routes>
    </>
  )
}
