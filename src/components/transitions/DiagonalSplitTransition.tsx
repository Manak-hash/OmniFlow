import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, useRef } from 'react'
import { usePreferences } from '@/store/preferences'
import { getThemeById } from '@/utils/themes'
import type { TransitionCallbacks } from './types'

interface DiagonalSplitTransitionProps extends TransitionCallbacks {}

/**
 * Diagonal Split transition (0.65s)
 * 45° split from top-left to bottom-right
 *
 * Animation: Triangles close FROM borders TO center
 *
 * Design:
 * - Top-left triangle: Dark background (theme colors)
 * - Bottom-right triangle: Accent color (theme colors)
 * - Glowing diagonal line
 * - Single persistent logo (no text, no bg)
 * - Particle effects along diagonal
 */
export default function DiagonalSplitTransition({
  onPhaseChange,
  onComplete,
  onSkip,
  onError,
}: DiagonalSplitTransitionProps) {
  const [phase, setPhase] = useState<'fade-out' | 'fade-in' | 'complete'>('fade-out')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const callbacksRef = useRef({ onPhaseChange, onComplete, onSkip, onError })

  // Get theme colors
  const { theme: themeId } = usePreferences()
  const theme = getThemeById(themeId)

  const colors = {
    topLeft: theme.colors.bg || '#1a1a1a',
    bottomRight: theme.colors.primary || '#ef4444',
    glow: theme.colors.primaryGlow || 'rgba(239, 68, 68, 0.5)',
  }

  // Detect which app we're in for logo selection
  const [currentApp, setCurrentApp] = useState<'omnitoys' | 'omniflow'>('omnitoys')

  useEffect(() => {
    // Detect from hostname (more reliable than port)
    const isOmniFlow = window.location.hostname === 'omniflow.vercel.app' ||
                       window.location.hostname.includes('omniflow') ||
                       (window.location.port && parseInt(window.location.port) % 2 === 0) // OmniFlow uses even ports in dev
    setCurrentApp(isOmniFlow ? 'omniflow' : 'omnitoys')
  }, [])

  // Particle system
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: i * 0.03,
    }))
    setParticles(newParticles)
  }, [])

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
    onPhaseChange?.('fade-out')

    // If user prefers reduced motion, skip animation
    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        callbacksRef.current.onComplete?.()
      }, 50)
      return () => clearTimeout(timer)
    }

    // Phase 1: Opening (0.3s) - triangles close from borders to center
    const openTimer = setTimeout(() => {
      setPhase('fade-in')
      onPhaseChange?.('fade-in')

      // Phase 2: Stay open briefly (0.15s) then complete
      const stayTimer = setTimeout(() => {
        setPhase('complete')
        onPhaseChange?.('complete')
        callbacksRef.current.onComplete?.()
      }, 450) // 0.3s close + 0.15s stay

      return () => clearTimeout(stayTimer)
    }, 300)

    return () => clearTimeout(openTimer)
  }, [prefersReducedMotion, onPhaseChange, currentApp])

  // Calculate triangle clip-path
  // Animation: Starts FULL (no gap), closes TO center (creates gap)
  const isClosing = phase === 'fade-in'
  const splitPercentage = isClosing ? 12 : 0 // 12% gap when closed

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Switching apps"
    >
      {/* Screen reader announcement */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {phase === 'fade-out' && 'Switching apps...'}
        {phase === 'fade-in' && 'Almost there...'}
        {phase === 'complete' && 'Complete!'}
      </div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay: 0.1, duration: 0.15 }}
        onClick={handleSkip}
        className="fixed top-6 right-6 px-4 py-2 bg-gray-900/60 hover:bg-gray-800/70 backdrop-blur-md rounded-lg text-sm font-medium text-white/90 hover:text-white transition-all duration-200 z-50 border border-white/10 shadow-lg"
        aria-label="Skip transition animation"
      >
        Skip <span className="text-xs text-white/50 ml-1">(ESC)</span>
      </motion.button>

      {/* Top-left triangle - Dark - CLOSES FROM TOP-LEFT BORDER TO CENTER */}
      <motion.div
        initial={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 50%, 0% 100%)' }}
        animate={{
          clipPath: isClosing
            ? `polygon(0% 0%, 100% 0%, ${50 + splitPercentage}% ${50 - splitPercentage}%, 0% 100%)`
            : 'polygon(0% 0%, 100% 0%, 50% 50%, 0% 100%)',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute inset-0"
        style={{ backgroundColor: colors.topLeft }}
      />

      {/* Bottom-right triangle - Accent - CLOSES FROM BOTTOM-RIGHT BORDER TO CENTER */}
      <motion.div
        initial={{ clipPath: 'polygon(50% 50%, 100% 0%, 100% 100%, 0% 100%)' }}
        animate={{
          clipPath: isClosing
            ? `polygon(${50 - splitPercentage}% ${50 + splitPercentage}%, 100% 0%, 100% 100%, 0% 100%)`
            : 'polygon(50% 50%, 100% 0%, 100% 100%, 0% 100%)',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute inset-0"
        style={{ backgroundColor: colors.bottomRight }}
      />

      {/* Glowing diagonal line - appears as triangles close */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: isClosing ? 1 : 0, scaleX: isClosing ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute top-1/2 left-0 right-0 h-[2px] origin-center"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.glow}, ${colors.bottomRight}, ${colors.glow}, transparent)`,
          transform: 'translateY(-50%) rotate(-26.5deg)',
          filter: `drop-shadow(0 0 8px ${colors.glow})`,
          boxShadow: `0 0 20px ${colors.glow}`,
        }}
      />

      {/* Particle effects along diagonal - appear when closing */}
      <AnimatePresence>
        {isClosing && !prefersReducedMotion && particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0, scale: 0, x: particle.x, y: particle.x }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [particle.x, particle.x - 5, particle.x]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 1,
              delay: particle.delay,
              ease: 'easeOut',
            }}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              backgroundColor: colors.bottomRight,
              boxShadow: `0 0 6px ${colors.glow}`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Persistent logo in center - always visible, consistent animation */}
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={{
          scale: isClosing ? 1 : 1,
          opacity: 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative z-10 w-32 h-32 flex items-center justify-center"
      >
        {/* OmniToys logo */}
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: currentApp === 'omnitoys' ? 1 : 0 }}
          src="/apple-touch-icon.png"
          alt="OmniToys"
          className="absolute w-20 h-20 object-contain"
          style={{ filter: `drop-shadow(0 0 30px ${colors.glow})` }}
        />

        {/* OmniFlow logo */}
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: currentApp === 'omniflow' ? 1 : 0 }}
          src="/omniflow-logo.png"
          alt="OmniFlow"
          className="absolute w-20 h-20 object-contain"
          style={{ filter: `drop-shadow(0 0 30px ${colors.glow})` }}
        />

        {/* Glow behind logos - always visible */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Progress indicator at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20"
        aria-hidden="true"
      >
        {['fade-out', 'fade-in'].map((p, i) => (
          <motion.div
            key={p}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase === p ? 1 : phase === 'complete' ? 1 : 0 }}
            transition={{ duration: 0.25, delay: i * 0.25 }}
            className="h-1 w-16 rounded-full origin-left"
            style={{ backgroundColor: colors.bottomRight }}
          />
        ))}
      </motion.div>
    </div>
  )
}
