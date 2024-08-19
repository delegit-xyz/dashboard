import { Route, Routes } from 'react-router-dom'

import { About } from '@/pages/About'

const pages = [
  {
    path: '',
    element: <About />,
  },
  {
    path: '/about',
    element: <About />,
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
