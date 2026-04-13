import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { PWAProvider } from '@/contexts/PWAContext'
import { TransitionProvider } from '@/contexts/TransitionContext'
import { Transition } from '@/components/transitions'
import MindMapPage from './pages/MindMapPage'
import SharedMindmapPage from './pages/SharedMindmapPage'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import SettingsPage from './pages/SettingsPage'
import { useState } from 'react'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/project/:id',
    element: <ProjectPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '/mindmap',
    element: <MindMapPage />,
  },
  {
    path: '/shared/:id',
    element: <SharedMindmapPage />,
  },
], {
  basename: '/omniflow',
})

function App() {
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null)

  const handleTransitionTrigger = (targetUrl: string) => {
    setTransitionTarget(targetUrl)
  }

  const handleTransitionComplete = () => {
    setTransitionTarget(null)
  }

  return (
    <PWAProvider>
      <TransitionProvider onTransitionTrigger={handleTransitionTrigger}>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" theme="dark" />

        {/* Transition overlay */}
        {transitionTarget && (
          <Transition
            targetUrl={transitionTarget}
            onComplete={handleTransitionComplete}
          />
        )}
      </TransitionProvider>
    </PWAProvider>
  )
}

export default App
