import { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTransitionStore } from '@/store/transition'
import { useWormhole } from './Wormhole'
import { useParticleSystem } from './ParticleSystem'
import { useSoundSystem } from './SoundSystem'
import { useRealityDistortion } from './RealityDistortion'
import { useSpaceTimeRipples } from './SpaceTimeRipples'
import type { TransitionCallbacks } from '../types'
import type { TimeMachinePhase } from './types'

interface TimeMachineTransitionProps extends TransitionCallbacks {}

const PHASE_DURATION = 4000 // 4 seconds total
const PHASES: Array<{ name: TimeMachinePhase; start: number; end: number }> = [
  { name: 'wormhole', start: 0, end: 0.25 }, // 0-1s
  { name: 'temporal-distortion', start: 0.25, end: 0.5 }, // 1-2s
  { name: 'chrono-vortex', start: 0.5, end: 0.75 }, // 2-3s
  { name: 'logo-transformation', start: 0.75, end: 1 }, // 3-4s
]

/**
 * Time Machine transition (4s cinematic)
 * OPT-IN experimental feature with:
 * - Wormhole visualization
 * - Temporal distortion (UI warping)
 * - Chrono vortex (clock gears)
 * - Particle-based logo transformation
 * - Deep bass sound design
 * - Space-time ripples
 */
export default function TimeMachineTransition({
  onPhaseChange,
  onComplete,
  onSkip,
}: TimeMachineTransitionProps) {
  const soundEnabled = useTransitionStore((state) => state.soundEnabled)
  const [phase, setPhase] = useState<TimeMachinePhase>('idle')
  const [progress, setProgress] = useState(0) // 0-1
  const [particlePhase, setParticlePhase] = useState<'dissolve' | 'spiral' | 'reassemble' | 'complete'>('dissolve')

  const wormholeCanvasRef = useRef<HTMLCanvasElement>(null)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)
  const rippleCanvasRef = useRef<HTMLCanvasElement>(null)

  // Sound system
  const { initAudio, playBassCrescendo, playResolution, cleanup } = useSoundSystem({
    enabled: soundEnabled,
    volume: 0.3,
  })

  // Visual effects
  useWormhole({
    canvas: wormholeCanvasRef.current,
    progress,
    themeColors: {
      primary: '#ef4444',
      accent: '#3b82f6',
      bg: '#1a1a1a',
    },
  })

  useParticleSystem({
    canvas: particleCanvasRef.current,
    phase: particlePhase,
    progress,
  })

  useRealityDistortion({ intensity: progress * 0.8 })

  useSpaceTimeRipples({
    canvas: rippleCanvasRef.current,
    progress,
    color: '#ef4444',
  })

  // Handle skip
  const handleSkip = useCallback(() => {
    cleanup()
    onSkip?.()
  }, [cleanup, onSkip])

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSkip])

  // Main transition sequence
  useEffect(() => {
    onPhaseChange?.('wormhole')
    setPhase('wormhole')

    // Initialize audio on first user interaction
    const handleUserInteraction = () => {
      initAudio()
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)

    // Start bass crescendo
    if (soundEnabled) {
      playBassCrescendo(PHASE_DURATION / 1000)
    }

    // Progress timeline
    const startTime = Date.now()

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(1, elapsed / PHASE_DURATION)
      setProgress(newProgress)

      // Determine current phase
      const currentPhase = PHASES.find((p) => newProgress >= p.start && newProgress < p.end)
      if (currentPhase && currentPhase.name !== phase) {
        setPhase(currentPhase.name)
        onPhaseChange?.(currentPhase.name)

        // Update particle phase based on transition phase
        if (currentPhase.name === 'chrono-vortex') {
          setParticlePhase('spiral')
        } else if (currentPhase.name === 'logo-transformation') {
          setParticlePhase('reassemble')
        }
      }

      // Check for completion
      if (newProgress >= 1) {
        clearInterval(progressInterval)
        setPhase('complete')
        setParticlePhase('complete')
        onPhaseChange?.('complete')

        // Play resolution tone
        if (soundEnabled) {
          playResolution()
        }

        // Complete after short delay
        setTimeout(() => {
          onComplete?.()
        }, 500)
      }
    }, 16) // ~60fps

    return () => {
      clearInterval(progressInterval)
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      cleanup()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Canvas layers */}
      <canvas
        ref={wormholeCanvasRef}
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
      <canvas
        ref={particleCanvasRef}
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full"
      />
      <canvas
        ref={rippleCanvasRef}
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full"
      />

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleSkip}
        className="fixed top-6 right-6 px-4 py-2 bg-gray-900/60 hover:bg-gray-800/70 backdrop-blur-md rounded-lg text-sm font-medium text-white/90 hover:text-white transition-all duration-200 z-50 border border-white/10 shadow-lg"
        aria-label="Skip transition"
      >
        Skip <span className="text-xs text-white/50 ml-1">(ESC)</span>
      </motion.button>

      {/* Phase indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {PHASES.map((p) => (
          <motion.div
            key={p.name}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress >= p.start ? (progress >= p.end ? 1 : (progress - p.start) / (p.end - p.start)) : 0 }}
            className="h-1 w-16 bg-gradient-to-r from-omni-primary to-omni-accent rounded-full origin-left"
          />
        ))}
      </div>

      {/* Center vortex */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: 1 + progress * 0.5,
          rotate: progress * 360,
        }}
        style={{
          filter: `blur(${progress * 10}px)`,
        }}
      >
        <div
          className="w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, #ffffff 0%, #ef4444 30%, #3b82f6 60%, transparent 100%)',
            opacity: 0.5 + progress * 0.5,
          }}
        />
      </motion.div>
    </div>
  )
}
