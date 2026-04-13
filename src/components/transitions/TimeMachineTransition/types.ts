/**
 * Time Machine Transition Types
 * 4-second cinematic transition with wormhole, temporal distortion, and chrono vortex
 */

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  alpha: number
}

export interface LogoParticle {
  id: string
  originX: number
  originY: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  alpha: number
  phase: 'idle' | 'dissolve' | 'spiral' | 'reassemble' | 'complete'
}

export interface WormholeLayer {
  speed: number
  radius: number
  color: string
  opacity: number
}

export interface AudioContextType {
  context: AudioContext | null
  masterGain: GainNode | null
  isInitialized: boolean
}

export type TimeMachinePhase =
  | 'idle'
  | 'wormhole'
  | 'temporal-distortion'
  | 'chrono-vortex'
  | 'logo-transformation'
  | 'complete'

export interface TimeMachineState {
  phase: TimeMachinePhase
  progress: number // 0-1
  isPlaying: boolean
  isSkipped: boolean
}
