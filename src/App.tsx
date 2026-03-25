import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import MindMapPage from './pages/MindMapPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MindMapPage />,
  },
  {
    path: '/mindmap/:id',
    element: <MindMapPage />,
  },
])

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" theme="dark" />
    </>
  )
}

export default App
