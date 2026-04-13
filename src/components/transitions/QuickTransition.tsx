import { motion } from 'framer-motion'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { TransitionCallbacks } from './types'

interface QuickTransitionProps extends TransitionCallbacks {}

/**
 * Quick transition (0.5s fade)
 * Default transition style for fast, smooth app switching
 *
 * Design: Clean, minimal fade with subtle logo animation
 * - Fade out: 0.25s with logo scale-down
 * - Fade in: 0.25s with logo scale-up
 * - Skip: ESC key or button click
 * - Accessibility: Respects prefers-reduced-motion
 */
export default function QuickTransition({
  onPhaseChange,
  onComplete,
  onSkip,
  onError,
}: QuickTransitionProps) {
  const [phase, setPhase] = useState<'fade-out' | 'fade-in' | 'complete'>('fade-out')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const callbacksRef = useRef({ onPhaseChange, onComplete, onSkip, onError })

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Update ref to avoid stale closures
  useEffect(() => {
    callbacksRef.current = { onPhaseChange, onComplete, onSkip, onError }
  }, [onPhaseChange, onComplete, onSkip, onError])

  const handleSkip = useCallback(() => {
    callbacksRef.current.onSkip?.()
  }, [])

  // Handle ESC key for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSkip])

  // Transition sequence
  useEffect(() => {
    callbacksRef.current.onPhaseChange?.('fade-out')

    // If user prefers reduced motion, skip animation entirely
    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        callbacksRef.current.onComplete?.()
      }, 50) // Minimal delay for state update
      return () => clearTimeout(timer)
    }

    // Phase 1: Fade out (0.25s)
    const fadeOutTimer = setTimeout(() => {
      setPhase('fade-in')
      callbacksRef.current.onPhaseChange?.('fade-in')

      // Phase 2: Fade in (0.25s)
      const fadeInTimer = setTimeout(() => {
        setPhase('complete')
        callbacksRef.current.onPhaseChange?.('complete')
        callbacksRef.current.onComplete?.()
      }, 250)

      return () => clearTimeout(fadeInTimer)
    }, 250)

    return () => clearTimeout(fadeOutTimer)
  }, [prefersReducedMotion])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Switching to OmniFlow"
    >
      {/* Screen reader announcement */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {phase === 'fade-out' && 'Switching to OmniFlow...'}
        {phase === 'fade-in' && 'Almost there...'}
        {phase === 'complete' && 'Complete!'}
      </div>

      {/* Skip button - top right with glass morphism */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.15 }}
        onClick={handleSkip}
        className="fixed top-6 right-6 px-4 py-2 bg-gray-900/60 hover:bg-gray-800/70 backdrop-blur-md rounded-lg text-sm font-medium text-white/90 hover:text-white transition-all duration-200 z-50 border border-white/10 shadow-lg"
        aria-label="Skip transition animation"
      >
        Skip <span className="text-xs text-white/50 ml-1">(ESC)</span>
      </motion.button>

      {/* Fade overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'fade-out' ? 1 : phase === 'fade-in' ? 0 : 0,
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-br from-omni-bg via-gray-900 to-omni-bg"
        aria-hidden="true"
      />

      {/* Logo animation with scale and glow */}
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={{
          scale: phase === 'fade-out' ? 0.85 : phase === 'fade-in' ? 1.15 : 1,
          opacity: phase === 'complete' ? 0 : 1,
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smooth feel
        }}
        className="relative z-10"
        aria-hidden="true"
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 blur-3xl rounded-full"
          animate={{
            scale: phase === 'fade-out' ? 1.2 : 1.5,
            opacity: phase === 'fade-out' ? 0.3 : 0.1,
          }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
          }}
        />

        {/* OmniSwitcher logo - gear icon */}
        <svg
          width="100"
          height="100"
          viewBox="0 0 120 120"
          className="relative text-omni-primary drop-shadow-2xl"
          aria-hidden="true"
        >
          {/* Outer gear spokes */}
          <motion.g
            animate={{ rotate: phase === 'fade-out' ? 180 : 360 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <path
              d="M60 30 L60 10 M60 90 L60 110 M30 60 L10 60 M90 60 L110 60"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M38.38 38.38 L24.14 24.14 M81.62 38.38 L95.86 24.14"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M38.38 81.62 L24.14 95.86 M81.62 81.62 L95.86 95.86"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Outer circle */}
          <circle
            cx="60"
            cy="60"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />

          {/* Inner dot */}
          <motion.circle
            cx="60"
            cy="60"
            r="8"
            fill="currentColor"
            animate={{
              scale: phase === 'fade-out' ? 1 : 1.2,
              opacity: phase === 'fade-out' ? 1 : 0.8,
            }}
            transition={{ duration: 0.25, delay: phase === 'fade-out' ? 0 : 0.25 }}
          />
        </svg>
      </motion.div>

      {/* Progress indicator at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20"
        aria-hidden="true"
      >
        {['fade-out', 'fade-in'].map((p, i) => (
          <motion.div
            key={p}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase === p ? 1 : phase === 'complete' ? 1 : 0 }}
            transition={{ duration: 0.25, delay: i * 0.25 }}
            className="h-1 w-12 bg-omni-primary rounded-full origin-left"
          />
        ))}
      </motion.div>
    </div>
  )
}
