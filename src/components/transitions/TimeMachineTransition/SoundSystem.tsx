import { useRef, useCallback } from 'react'
import type { AudioContextType } from './types'

interface SoundSystemOptions {
  enabled: boolean
  volume?: number
}

/**
 * Sound system for Time Machine transition
 * Uses Web Audio API for bass crescendo and spatial effects
 */
export function useSoundSystem({ enabled, volume = 0.3 }: SoundSystemOptions) {
  const audioRef = useRef<AudioContextType>({
    context: null,
    masterGain: null,
    isInitialized: false,
  })

  // Initialize audio context (must be triggered by user interaction)
  const initAudio = useCallback(() => {
    if (!enabled || audioRef.current.isInitialized) return

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const context = new AudioContextClass()
      const masterGain = context.createGain()

      masterGain.gain.value = volume
      masterGain.connect(context.destination)

      audioRef.current = {
        context,
        masterGain,
        isInitialized: true,
      }
    } catch (error) {
      console.warn('[SoundSystem] Failed to initialize audio:', error)
    }
  }, [enabled, volume])

  // Play bass tone (Inception-style horn crescendo)
  const playBassCrescendo = useCallback((duration: number) => {
    if (!enabled || !audioRef.current.context) return

    const { context, masterGain } = audioRef.current
    if (!context || !masterGain) return

    try {
      // Create oscillator for bass tone
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      // Brass-like bass tone
      oscillator.type = 'sawtooth'
      oscillator.frequency.value = 55 // Low A (55Hz)

      // Add slight vibrato
      const lfo = context.createOscillator()
      const lfoGain = context.createGain()
      lfo.frequency.value = 5 // 5Hz vibrato
      lfoGain.gain.value = 3
      lfo.connect(lfoGain)
      lfoGain.connect(oscillator.frequency)
      lfo.start()

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(masterGain)

      // Envelope: crescendo over duration
      const now = context.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.8, now + duration * 0.8)
      gainNode.gain.linearRampToValueAtTime(0, now + duration)

      // Start and stop
      oscillator.start(now)
      oscillator.stop(now + duration)
      lfo.stop(now + duration)

      // Cleanup
      setTimeout(() => {
        oscillator.disconnect()
        gainNode.disconnect()
        lfo.disconnect()
        lfoGain.disconnect()
      }, duration * 1000 + 100)
    } catch (error) {
      console.warn('[SoundSystem] Failed to play bass crescendo:', error)
    }
  }, [enabled])

  // Play whoosh sound
  const playWhoosh = useCallback(() => {
    if (!enabled || !audioRef.current.context) return

    const { context, masterGain } = audioRef.current
    if (!context || !masterGain) return

    try {
      // Create noise for whoosh
      const bufferSize = context.sampleRate * 0.5 // 0.5 seconds
      const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = context.createBufferSource()
      noise.buffer = buffer

      // Filter for whoosh effect
      const filter = context.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 1000
      filter.Q.value = 1

      const gainNode = context.createGain()

      // Connect
      noise.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(masterGain)

      // Envelope
      const now = context.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.5, now + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, now + 0.5)

      // Start
      noise.start(now)
      noise.stop(now + 0.5)

      // Cleanup
      setTimeout(() => {
        noise.disconnect()
        filter.disconnect()
        gainNode.disconnect()
      }, 600)
    } catch (error) {
      console.warn('[SoundSystem] Failed to play whoosh:', error)
    }
  }, [enabled])

  // Play resolution tone (when complete)
  const playResolution = useCallback(() => {
    if (!enabled || !audioRef.current.context) return

    const { context, masterGain } = audioRef.current
    if (!context || !masterGain) return

    try {
      // Create chord for resolution
      const frequencies = [220, 277.18, 329.63] // A major chord

      frequencies.forEach((freq, i) => {
        const osc = context.createOscillator()
        const gain = context.createGain()

        osc.type = 'sine'
        osc.frequency.value = freq

        osc.connect(gain)
        gain.connect(masterGain)

        const now = context.currentTime
        const delay = i * 0.1 // Stagger slightly

        gain.gain.setValueAtTime(0, now + delay)
        gain.gain.linearRampToValueAtTime(0.3, now + delay + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1)

        osc.start(now + delay)
        osc.stop(now + delay + 1)

        setTimeout(() => {
          osc.disconnect()
          gain.disconnect()
        }, (delay + 1.1) * 1000)
      })
    } catch (error) {
      console.warn('[SoundSystem] Failed to play resolution:', error)
    }
  }, [enabled])

  // Cleanup
  const cleanup = useCallback(() => {
    if (audioRef.current.context) {
      audioRef.current.context.close()
      audioRef.current = {
        context: null,
        masterGain: null,
        isInitialized: false,
      }
    }
  }, [])

  return {
    initAudio,
    playBassCrescendo,
    playWhoosh,
    playResolution,
    cleanup,
    isReady: audioRef.current.isInitialized,
  }
}
