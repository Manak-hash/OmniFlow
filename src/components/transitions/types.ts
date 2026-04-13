/**
 * Transition system type definitions
 * Supports both Quick (0.5s fade) and Time Machine (4s cinematic) transitions
 */

export type TransitionStyle = 'quick' | 'time-machine' | 'none'

export interface TransitionConfig {
  style: TransitionStyle
  soundEnabled: boolean
  hasSeenPhotosensitivityWarning: boolean
  skipCount: number
  lastUsed: number // timestamp
}

export interface TransitionPhase {
  name: string
  duration: number
  progress: number
}

export type TransitionPhaseName =
  | 'idle'
  | 'fade-out'
  | 'wormhole'
  | 'temporal-distortion'
  | 'chrono-vortex'
  | 'logo-transformation'
  | 'fade-in'
  | 'complete'

export interface TransitionState {
  phase: TransitionPhaseName
  progress: number
  isPlaying: boolean
  isSkipped: boolean
  error: Error | null
}

export interface TransitionCallbacks {
  onStart?: () => void
  onPhaseChange?: (phase: TransitionPhaseName) => void
  onComplete?: () => void
  onSkip?: () => void
  onError?: (error: Error) => void
}
