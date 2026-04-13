import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useTransitionStore } from '@/store/transition'
import type { TransitionCallbacks, TransitionState, TransitionPhaseName } from './types'

// Lazy load transition components for code splitting
const DiagonalSplitTransition = lazy(() => import('./DiagonalSplitTransition'))
const TimeMachineTransition = lazy(() => import('./TimeMachineTransition/TimeMachineTransition'))

interface TransitionProps {
  /** Called when transition completes successfully */
  onComplete?: () => void
  /** Called when user skips transition */
  onSkip?: () => void
  /** Called if transition encounters error */
  onError?: (error: Error) => void
  /** Target URL to navigate to after transition */
  targetUrl: string
}

/**
 * Main transition component that routes to appropriate transition style
 *
 * Usage:
 * ```tsx
 * <Transition
 *   targetUrl="/omniflow"
 *   onComplete={() => {/* Handle navigation complete *\/}}
 *   onSkip={() => {/* Handle user skip *\/}}
 * />
 * ```
 */
export function Transition({ onComplete, onSkip, onError, targetUrl }: TransitionProps) {
  const style = useTransitionStore((state) => state.style)
  const [_, setTransitionState] = useState<TransitionState>({
    phase: 'idle',
    progress: 0,
    isPlaying: false,
    isSkipped: false,
    error: null,
  })

  const handlePhaseChange = useCallback((phase: TransitionPhaseName) => {
    setTransitionState((prev) => ({ ...prev, phase }))
  }, [])

  const handleComplete = useCallback(() => {
    setTransitionState((prev) => ({ ...prev, phase: 'complete', isPlaying: false }))

    // Record successful usage
    useTransitionStore.getState().recordUsage()

    // Navigate to target
    window.location.href = targetUrl

    onComplete?.()
  }, [targetUrl, onComplete])

  const handleSkip = useCallback(() => {
    setTransitionState((prev) => ({ ...prev, isSkipped: true, isPlaying: false }))

    // Record skip for analytics
    useTransitionStore.getState().recordSkip()

    // Navigate immediately
    window.location.href = targetUrl

    onSkip?.()
  }, [targetUrl, onSkip])

  const handleError = useCallback((error: Error) => {
    setTransitionState((prev) => ({ ...prev, error, isPlaying: false }))

    // Fallback: navigate anyway
    window.location.href = targetUrl

    onError?.(error)
  }, [targetUrl, onError])

  // Start transition on mount
  useEffect(() => {
    setTransitionState((prev) => ({ ...prev, isPlaying: true, phase: 'fade-out' }))
  }, [])

  // Route to appropriate transition component
  const TransitionComponent = style === 'none' ? null : style === 'time-machine' ? TimeMachineTransition : DiagonalSplitTransition

  if (style === 'none') {
    // Instant navigation, no transition
    window.location.href = targetUrl
    return null
  }

  const callbacks: TransitionCallbacks = {
    onStart: () => setTransitionState((prev) => ({ ...prev, isPlaying: true })),
    onPhaseChange: handlePhaseChange,
    onComplete: handleComplete,
    onSkip: handleSkip,
    onError: handleError,
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-omni-bg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-omni-primary" />
        </div>
      }
    >
      {TransitionComponent && <TransitionComponent {...callbacks} />}
    </Suspense>
  )
}

/**
 * Hook to trigger transitions from anywhere in the app
 *
 * Usage:
 * ```tsx
 * const { triggerTransition } = useTransition()
 *
 * <button onClick={() => triggerTransition('/omniflow')}>
 *   Go to OmniFlow
 * </button>
 * ```
 */
export function useTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const triggerTransition = useCallback(
    (_targetUrl: string, _callbacks?: Omit<TransitionCallbacks, 'onPhaseChange'>) => {
      setIsTransitioning(true)

      // Create a portal to render the transition
      const root = document.getElementById('transition-root') || document.body
      const container = document.createElement('div')
      container.id = 'transition-container'
      root.appendChild(container)

      // Render will be handled by React, we just set state
      // The actual Transition component should be rendered in App.tsx based on this state
    },
    []
  )

  return { isTransitioning, triggerTransition }
}
