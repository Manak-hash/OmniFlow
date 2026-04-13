/**
 * Theme Synchronization System
 *
 * Handles theme synchronization between OmniToys and OmniFlow
 * Uses BroadcastChannel for real-time updates
 */

import { themes, type Theme } from '@/utils/themes'
import { CHANNELS } from './OmniNavigation'

export interface ThemeSyncEvent {
  type: 'THEME_CHANGE' | 'THEME_SYNC_REQUEST'
  themeId: string
  timestamp: string
}

export class ThemeSyncManager {
  private channel: BroadcastChannel
  private currentTheme: Theme
  private listeners: Set<(theme: Theme) => void>

  constructor() {
    this.channel = new BroadcastChannel(CHANNELS.THEME)
    this.currentTheme = this.loadTheme()
    this.listeners = new Set()

    // Listen for theme changes from other app
    this.channel.addEventListener('message', this.handleMessage.bind(this))

    // Apply saved theme
    this.applyTheme(this.currentTheme)
  }

  // ========================================================================
  // THEME LOADING
  // ========================================================================

  private loadTheme(): Theme {
    const themeId = localStorage.getItem('omni-theme-preference') || 'cyberpunk-red'
    return themes.find(t => t.id === themeId) || themes[0]
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  getCurrentTheme(): Theme {
    return this.currentTheme
  }

  setTheme(themeId: string): void {
    const theme = themes.find(t => t.id === themeId)
    if (!theme) {
      console.warn(`[ThemeSync] Theme not found: ${themeId}`)
      return
    }

    // Update local state
    this.currentTheme = theme
    localStorage.setItem('omni-theme-preference', themeId)

    // Apply theme
    this.applyTheme(theme)

    // Broadcast to other app
    this.channel.postMessage({
      type: 'THEME_CHANGE',
      themeId,
      timestamp: new Date().toISOString()
    } as ThemeSyncEvent)

    // Notify listeners
    this.notifyListeners()
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // ========================================================================
  // THEME APPLICATION
  // ========================================================================

  private applyTheme(theme: Theme): void {
    const root = document.documentElement

    // Apply all color variables
    root.style.setProperty('--color-bg', theme.colors.bg)
    root.style.setProperty('--color-bg-secondary', theme.colors.bgSecondary)
    root.style.setProperty('--color-bg-tertiary', theme.colors.bgTertiary)
    root.style.setProperty('--color-text', theme.colors.text)
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--color-text-tertiary', theme.colors.textTertiary)
    root.style.setProperty('--color-primary', theme.colors.primary)
    root.style.setProperty('--color-primary-hover', theme.colors.primaryHover)
    root.style.setProperty('--color-primary-glow', theme.colors.primaryGlow)
    root.style.setProperty('--color-accent', theme.colors.accent)
    root.style.setProperty('--color-accent-glow', theme.colors.accentGlow)
    root.style.setProperty('--color-border', theme.colors.border)
    root.style.setProperty('--color-border-hover', theme.colors.borderHover)
    root.style.setProperty('--color-success', theme.colors.success)
    root.style.setProperty('--color-warning', theme.colors.warning)
    root.style.setProperty('--color-error', theme.colors.error)

    // Apply font
    root.style.setProperty('--font-family', theme.fontFamily)
    root.style.setProperty('--font-heading-weight', theme.headingWeight)
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private handleMessage(event: MessageEvent<ThemeSyncEvent>): void {
    const { type, themeId } = event.data

    if (type === 'THEME_CHANGE') {
      const theme = themes.find(t => t.id === themeId)
      if (theme && theme.id !== this.currentTheme.id) {
        // Update local state
        this.currentTheme = theme
        localStorage.setItem('omni-theme-preference', themeId)

        // Apply theme
        this.applyTheme(theme)

        // Notify listeners
        this.notifyListeners()
      }
    }

    if (type === 'THEME_SYNC_REQUEST') {
      // Respond with current theme
      this.channel.postMessage({
        type: 'THEME_CHANGE',
        themeId: this.currentTheme.id,
        timestamp: new Date().toISOString()
      } as ThemeSyncEvent)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme))
  }
}

// ========================================================================
// SINGLETON INSTANCE
// ========================================================================

let themeSyncManager: ThemeSyncManager | null = null

export function getThemeSyncManager(): ThemeSyncManager {
  if (!themeSyncManager) {
    themeSyncManager = new ThemeSyncManager()
  }
  return themeSyncManager
}

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

/**
 * Get current theme
 */
export function getCurrentTheme(): Theme {
  return getThemeSyncManager().getCurrentTheme()
}

/**
 * Set theme (syncs across both apps)
 */
export function setTheme(themeId: string): void {
  getThemeSyncManager().setTheme(themeId)
}

/**
 * Subscribe to theme changes
 */
export function subscribeToTheme(listener: (theme: Theme) => void): () => void {
  return getThemeSyncManager().subscribe(listener)
}
