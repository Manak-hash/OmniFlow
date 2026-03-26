import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import MindMapPage from './pages/MindMapPage'
import SharedMindmapPage from './pages/SharedMindmapPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MindMapPage />,
  },
  {
    path: '/mindmap/:id',
    element: <MindMapPage />,
  },
  {
    path: '/shared/:token',
    element: <SharedMindmapPage />,
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
