import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ReplicacheProvider } from './providers/ReplicacheProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReplicacheProvider>
      <App />
    </ReplicacheProvider>
  </StrictMode>
)
