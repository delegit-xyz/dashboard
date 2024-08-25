import { Route, Routes } from 'react-router-dom'

import { Home } from '@/pages/Home'
import { Delegate } from '@/pages/Delegate'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { useNetwork } from './contexts/NetworkContext'
const pages = [
  {
    path: '',
    element: <Home />,
  },
  {
    path: '/home',
    element: <Home />,
  },
  {
    path: '/delegate/:address',
    element: <Delegate />,
  },
]

export const Content = () => {
  const { lightClientLoaded, isLight } = useNetwork()

  useEffect(() => {
    isLight && lightClientLoaded && toast.success('Light client: Synced')
  }, [isLight, lightClientLoaded])

  console.log('==> Delegit FTW')
  return (
    <>
      <Routes>
        {pages.map(({ path, element }, i) => {
          return <Route key={`page_${i}`} path={path} element={element} />
        })}
      </Routes>
    </>
  )
}
