import { Route, Routes } from 'react-router-dom'

import { Home } from '@/pages/Home'

const pages = [
  {
    path: '',
    element: <Home />,
  },
  {
    path: '/home',
    element: <Home />,
  },
]

export const Content = () => {
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
