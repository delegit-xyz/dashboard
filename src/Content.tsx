import { Route, Routes } from 'react-router-dom'

import { Home } from '@/pages/Home'
import { Delegate } from '@/pages/Delegate'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { useNetwork } from './contexts/NetworkContext'
import { RedirectByName } from './components/RedirectByName'

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
  {
    path: '/:network/:name',
    element: <RedirectByName />,
  },
]

export const Content = () => {
  const { lightClientLoaded, isLight } = useNetwork()

  useEffect(() => {
    if (isLight && lightClientLoaded) {
      toast.success('Light client: Connected')
    }
  }, [isLight, lightClientLoaded])

  return (
    <Routes>
      {pages.map(({ path, element }, i) => {
        return <Route key={`page_${i}`} path={path} element={element} />
      })}
    </Routes>
  )
}
