import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface TransitionContextValue {
  triggerTransition: (targetUrl: string) => void
  isTransitioning: boolean
}

const TransitionContext = createContext<TransitionContextValue | undefined>(undefined)

interface TransitionProviderProps {
  children: ReactNode
  onTransitionTrigger?: (targetUrl: string) => void
}

export function TransitionProvider({ children, onTransitionTrigger }: TransitionProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const triggerTransition = useCallback(
    (targetUrl: string) => {
      setIsTransitioning(true)
      onTransitionTrigger?.(targetUrl)
    },
    [onTransitionTrigger]
  )

  return (
    <TransitionContext.Provider value={{ triggerTransition, isTransitioning }}>
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransitionTrigger() {
  const context = useContext(TransitionContext)
  if (!context) {
    throw new Error('useTransitionTrigger must be used within TransitionProvider')
  }
  return context
}
