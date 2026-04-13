/**
 * OmniSwitcher Component
 *
 * Unified logo that switches between OmniToys and OmniFlow
 * Morphs "Toys" ↔ "Flow" while keeping "Omni" constant
 * Triggers cinematic transition on click
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, ChevronDown } from 'lucide-react'
import { getNavigationManager, switchToOmniFlow, switchToOmniToys } from '@/utils/navigation/OmniNavigation'
import { getCurrentTheme } from '@/utils/navigation/ThemeSync'
import type { OmniMode } from '@/utils/navigation/OmniNavigation'
import { cn } from '@/utils/cn'
import { useTransitionTrigger } from '@/contexts/TransitionContext'

interface OmniSwitcherProps {
  className?: string
  showSettings?: boolean
}

export function OmniSwitcher({ className, showSettings = false }: OmniSwitcherProps) {
  const [currentMode, setCurrentMode] = useState<OmniMode>('omnitoys')
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const { triggerTransition } = useTransitionTrigger()

  useEffect(() => {
    const manager = getNavigationManager()

    // Initial state
    setCurrentMode(manager.getState().currentMode)

    // Subscribe to changes
    const unsubscribe = manager.subscribe((state) => {
      setCurrentMode(state.currentMode)
    })

    return unsubscribe
  }, [])

  const handleSwitch = async () => {
    // Navigate to the REAL apps (not iframe embeds)
    const isDev = import.meta.env.DEV
    let targetUrl: string

    if (isDev) {
      // In dev, detect ports dynamically
      const currentPort = parseInt(window.location.port)
      if (currentMode === 'omnitoys') {
        // OmniToys (odd port) → OmniFlow (even port)
        const omniFlowPort = currentPort % 2 === 1 ? currentPort + 1 : currentPort + 2
        targetUrl = `http://localhost:${omniFlowPort}`
      } else {
        // OmniFlow (even port) → OmniToys (odd port)
        const omniToysPort = currentPort % 2 === 0 ? currentPort - 1 : currentPort - 2
        targetUrl = `http://localhost:${omniToysPort}`
      }
    } else {
      // Production URLs - same domain setup
      targetUrl = currentMode === 'omnitoys'
        ? '/omniflow' // OmniToys → OmniFlow (same domain)
        : '/' // OmniFlow → OmniToys (same domain)
    }

    // Broadcast mode change first
    if (currentMode === 'omnitoys') {
      await switchToOmniFlow()
    } else {
      await switchToOmniToys()
    }

    // Trigger transition (will handle navigation after animation)
    triggerTransition(targetUrl)
    setShowMenu(false)
  }

  const theme = getCurrentTheme()

  return (
    <div className={cn('relative', className)}>
      {/* Logo Button */}
      <motion.button
        onClick={handleSwitch}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="flex items-center gap-2 group relative"
      >
        {/* "Omni" - always visible */}
        <span className="font-black text-xl tracking-tighter" style={{ color: theme.colors.text }}>
          Omni
        </span>

        {/* Mode Indicator - Morphs between Toys/Flow */}
        <AnimatePresence mode="wait">
          {currentMode === 'omnitoys' ? (
            <motion.span
              key="toys"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="font-black text-xl"
              style={{
                color: theme.colors.primary,
                textShadow: `0 0 20px ${theme.colors.primaryGlow}`
              }}
            >
              Toys
            </motion.span>
          ) : (
            <motion.span
              key="flow"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="font-black text-xl"
              style={{
                color: theme.colors.accent,
                textShadow: `0 0 20px ${theme.colors.accentGlow}`
              }}
            >
              Flow
            </motion.span>
          )}
        </AnimatePresence>

        {/* Animated Gear Icon */}
        <motion.div
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Settings className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
        </motion.div>

        {/* Subtle Glow Effect */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-4 rounded-full"
            style={{
              background: currentMode === 'omnitoys'
                ? `radial-gradient(circle, ${theme.colors.primaryGlow} 0px, transparent 70%)`
                : `radial-gradient(circle, ${theme.colors.accentGlow} 0px, transparent 70%)`
            }}
          />
        )}
      </motion.button>

      {/* Settings Dropdown (if enabled) */}
      {showSettings && (
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="ml-2 p-1 rounded hover:bg-white/5 transition-colors"
        >
          <ChevronDown className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
        </button>
      )}
    </div>
  )
}
