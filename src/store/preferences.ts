import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  theme: string
  themeIntensity: number
  accessibilityMode: 'normal' | 'high-contrast'
  favorites: string[]
  recentTools: string[]
  lowDataMode: boolean
  vibrationEnabled: boolean
  setTheme: (themeId: string) => void
  setThemeIntensity: (intensity: number) => void
  setAccessibilityMode: (mode: 'normal' | 'high-contrast') => void
  setLowDataMode: (enabled: boolean) => void
  setVibrationEnabled: (enabled: boolean) => void
}

// Use the SAME localStorage key as OmniToys to share settings
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'cyberpunk-red',
      themeIntensity: 100,
      accessibilityMode: 'normal' as const,
      favorites: [],
      recentTools: [],
      lowDataMode: false,
      vibrationEnabled: true,
      setTheme: (themeId) => set({ theme: themeId }),
      setThemeIntensity: (themeIntensity) => set({ themeIntensity }),
      setAccessibilityMode: (accessibilityMode) => set({ accessibilityMode }),
      setLowDataMode: (lowDataMode) => set({ lowDataMode }),
      setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
    }),
    {
      name: 'omni-preferences', // Same key as OmniToys!
    }
  )
)
