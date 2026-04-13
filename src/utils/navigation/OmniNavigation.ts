/**
 * Unified Navigation System for OmniToys ↔ OmniFlow
 *
 * Architecture:
 * - Shared state via BroadcastChannel API
 * - Cross-app theme synchronization
 * - Logo-based mode switching
 * - Shared localStorage for preferences
 */

// ========================================================================
// TYPES
// ========================================================================

export type OmniMode = 'omnitoys' | 'omniflow'

export interface OmniState {
  currentMode: OmniMode
  isTransitioning: boolean
  transitionProgress: number
  lastModeSwitch: string
}

export interface OmniTheme {
  id: string
  colors: Record<string, string>
  fontFamily: string
  headingWeight: string
}

export interface OmniNavigationEvent {
  type: 'MODE_SWITCH' | 'THEME_CHANGE' | 'SYNC_REQUEST'
  mode?: OmniMode
  themeId?: string
  timestamp: string
}

// ========================================================================
// BROADCAST CHANNEL NAMES
// ========================================================================

export const CHANNELS = {
  NAVIGATION: 'omni-navigation',
  THEME: 'omni-theme',
  SYNC: 'omni-sync'
} as const

// ========================================================================
// SHARED STATE STORAGE KEYS
// ========================================================================

export const STORAGE_KEYS = {
  MODE: 'omni-current-mode',
  THEME: 'omni-theme-preference',
  TRANSITION: 'omni-last-transition',
  USER_ID: 'omni-user-id'
} as const

// ========================================================================
// NAVIGATION MANAGER
// ========================================================================

export class OmniNavigationManager {
  private channel: BroadcastChannel
  private state: OmniState
  private listeners: Set<(state: OmniState) => void>

  constructor() {
    this.channel = new BroadcastChannel(CHANNELS.NAVIGATION)
    this.state = {
      currentMode: this.loadMode(),
      isTransitioning: false,
      transitionProgress: 0,
      lastModeSwitch: this.getLastSwitch()
    }
    this.listeners = new Set()

    // Listen for cross-app messages
    this.channel.addEventListener('message', this.handleMessage.bind(this))
  }

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  private loadMode(): OmniMode {
    if (typeof window === 'undefined') return 'omnitoys'
    const stored = localStorage.getItem(STORAGE_KEYS.MODE)
    return (stored === 'omniflow' ? 'omniflow' : 'omnitoys')
  }

  private saveMode(mode: OmniMode): void {
    localStorage.setItem(STORAGE_KEYS.MODE, mode)
  }

  private getLastSwitch(): string {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem(STORAGE_KEYS.TRANSITION) || ''
  }

  private saveLastSwitch(): void {
    localStorage.setItem(STORAGE_KEYS.TRANSITION, new Date().toISOString())
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  getState(): OmniState {
    return { ...this.state }
  }

  subscribe(listener: (state: OmniState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async switchMode(mode: OmniMode): Promise<void> {
    if (this.state.currentMode === mode) return

    // Start transition
    this.state.isTransitioning = true
    this.state.transitionProgress = 0
    this.notifyListeners()

    // Broadcast mode switch
    this.channel.postMessage({
      type: 'MODE_SWITCH',
      mode,
      timestamp: new Date().toISOString()
    } as OmniNavigationEvent)

    // Update state
    this.state.currentMode = mode
    this.saveMode(mode)
    this.saveLastSwitch()

    // End transition after animation
    setTimeout(() => {
      this.state.isTransitioning = false
      this.state.transitionProgress = 100
      this.notifyListeners()
    }, 4000) // 4 second transition
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private handleMessage(event: MessageEvent<OmniNavigationEvent>): void {
    const { type, mode, themeId } = event.data

    switch (type) {
      case 'MODE_SWITCH':
        if (mode && mode !== this.state.currentMode) {
          this.state.currentMode = mode
          this.saveMode(mode)
          this.notifyListeners()
        }
        break

      case 'THEME_CHANGE':
        if (themeId) {
          // Handle theme change
        }
        break

      case 'SYNC_REQUEST':
        // Respond with current state
        this.channel.postMessage({
          type: 'MODE_SWITCH',
          mode: this.state.currentMode,
          timestamp: new Date().toISOString()
        } as OmniNavigationEvent)
        break
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()))
  }
}

// ========================================================================
// SINGLETON INSTANCE
// ========================================================================

let navigationManager: OmniNavigationManager | null = null

export function getNavigationManager(): OmniNavigationManager {
  if (!navigationManager) {
    navigationManager = new OmniNavigationManager()
  }
  return navigationManager
}

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

/**
 * Check if we're currently in OmniFlow mode
 */
export function isOmniFlow(): boolean {
  return getNavigationManager().getState().currentMode === 'omniflow'
}

/**
 * Check if we're currently in OmniToys mode
 */
export function isOmniToys(): boolean {
  return getNavigationManager().getState().currentMode === 'omnitoys'
}

/**
 * Get current mode
 */
export function getCurrentMode(): OmniMode {
  return getNavigationManager().getState().currentMode
}

/**
 * Switch to OmniFlow
 */
export async function switchToOmniFlow(): Promise<void> {
  return getNavigationManager().switchMode('omniflow')
}

/**
 * Switch to OmniToys
 */
export async function switchToOmniToys(): Promise<void> {
  return getNavigationManager().switchMode('omnitoys')
}
