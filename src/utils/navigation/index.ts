/**
 * Unified Navigation System for OmniFlow ↔ OmniToys
 *
 * Cross-app navigation with:
 * - Logo-based mode switching (OmniFlow ↔ OmniToys)
 * - Theme synchronization across both apps
 * - Shared state via BroadcastChannel
 */

export { OmniSwitcher } from '@/components/navigation/OmniSwitcher'
export { getNavigationManager, switchToOmniFlow, switchToOmniToys, getCurrentMode, isOmniFlow, isOmniToys } from '@/utils/navigation/OmniNavigation'
export { getCurrentTheme, setTheme } from '@/utils/navigation/ThemeSync'
