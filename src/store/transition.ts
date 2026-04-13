import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TransitionConfig, TransitionStyle } from '@/components/transitions/types'

interface TransitionStore extends TransitionConfig {
  setStyle: (style: TransitionStyle) => void
  setSoundEnabled: (enabled: boolean) => void
  dismissPhotosensitivityWarning: () => void
  recordSkip: () => void
  recordUsage: () => void
  reset: () => void
}

const DEFAULT_CONFIG: TransitionConfig = {
  style: 'quick', // Default to quick transition (0.5s fade)
  soundEnabled: false, // Sound is opt-in only
  hasSeenPhotosensitivityWarning: false,
  skipCount: 0,
  lastUsed: 0,
}

export const useTransitionStore = create<TransitionStore>()(
  persist(
    (set) => ({
      ...DEFAULT_CONFIG,

      setStyle: (style) =>
        set({
          style,
          // Reset warning counter when switching to time-machine
          hasSeenPhotosensitivityWarning: style === 'time-machine' ? DEFAULT_CONFIG.hasSeenPhotosensitivityWarning : undefined,
        }),

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

      dismissPhotosensitivityWarning: () =>
        set({ hasSeenPhotosensitivityWarning: true }),

      recordSkip: () =>
        set((state) => ({
          skipCount: state.skipCount + 1,
        })),

      recordUsage: () =>
        set({
          lastUsed: Date.now(),
          skipCount: 0, // Reset skip counter on successful use
        }),

      reset: () => set(DEFAULT_CONFIG),
    }),
    {
      name: 'omni-transition-preferences',
      // Only persist these fields
      partialize: (state) => ({
        style: state.style,
        soundEnabled: state.soundEnabled,
        hasSeenPhotosensitivityWarning: state.hasSeenPhotosensitivityWarning,
        skipCount: state.skipCount,
        lastUsed: state.lastUsed,
      }),
    }
  )
)

// Selectors for efficient reads
export const selectTransitionStyle = (state: TransitionStore) => state.style
export const selectSoundEnabled = (state: TransitionStore) => state.soundEnabled
export const selectHasSeenWarning = (state: TransitionStore) => state.hasSeenPhotosensitivityWarning
export const selectSkipCount = (state: TransitionStore) => state.skipCount
