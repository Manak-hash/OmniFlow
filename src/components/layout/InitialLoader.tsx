import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePreferences } from '@/store/preferences'
import { getThemeById } from '@/utils/themes'
import logo from '/omniflow-logo.png'

/**
 * InitialLoader - Welcome/Refresh Animation
 * Diagonal split closing from borders to center
 */
export function InitialLoader() {
  const [isVisible, setIsVisible] = useState(true)
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening')
  const { theme: themeId } = usePreferences()
  const theme = getThemeById(themeId)

  const colors = {
    topLeft: theme.colors.bg || '#1a1a1a',
    bottomRight: theme.colors.primary || '#ef4444',
    glow: theme.colors.primaryGlow || 'rgba(239, 68, 68, 0.5)',
  }

  useEffect(() => {

    // Safety timeout: Ensure loader always disappears after 3 seconds
    const safetyTimer = setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    // Phase 1: Opening (0.4s) - triangles close from borders to center
    const openTimer = setTimeout(() => {
      setPhase('open')

      // Phase 2: Stay open (0.3s)
      const stayTimer = setTimeout(() => {
        setPhase('closing')

        // Phase 3: Closing (0.4s)
        const closeTimer = setTimeout(() => {
          setIsVisible(false)
        }, 400)

        return () => clearTimeout(closeTimer)
      }, 300)

      return () => clearTimeout(stayTimer)
    }, 400)

    return () => {
      clearTimeout(openTimer)
      clearTimeout(safetyTimer)
    }
  }, [])

  const isOpen = phase === 'open' || phase === 'closing'
  const splitPercentage = isOpen ? 12 : 0 // 12% gap when open

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        >
          {/* Top-left triangle - Dark - closes from border to center */}
          <motion.div
            initial={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 50%, 0% 100%)' }}
            animate={{
              clipPath: isOpen
                ? `polygon(0% 0%, 100% 0%, ${50 + splitPercentage}% ${50 - splitPercentage}%, 0% 100%)`
                : 'polygon(0% 0%, 100% 0%, 50% 50%, 0% 100%)',
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{ backgroundColor: colors.topLeft }}
          />

          {/* Bottom-right triangle - Accent - closes from border to center */}
          <motion.div
            initial={{ clipPath: 'polygon(50% 50%, 100% 0%, 100% 100%, 0% 100%)' }}
            animate={{
              clipPath: isOpen
                ? `polygon(${50 - splitPercentage}% ${50 + splitPercentage}%, 100% 0%, 100% 100%, 0% 100%)`
                : 'polygon(50% 50%, 100% 0%, 100% 100%, 0% 100%)',
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{ backgroundColor: colors.bottomRight }}
          />

          {/* Glowing diagonal line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: isOpen ? 1 : 0, scaleX: isOpen ? 1 : 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute top-1/2 left-0 right-0 h-[2px] origin-center"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.glow}, ${colors.bottomRight}, ${colors.glow}, transparent)`,
              transform: 'translateY(-50%) rotate(-26.5deg)',
              filter: `drop-shadow(0 0 8px ${colors.glow})`,
              boxShadow: `0 0 20px ${colors.glow}`,
            }}
          />

          {/* Logo in center - always visible, no text, no bg */}
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              scale: isOpen ? 1 : 1,
              opacity: 1,
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="relative z-10 w-32 h-32 flex items-center justify-center"
          >
            <img
              src={logo}
              alt="OmniFlow"
              className="w-20 h-20 object-contain"
              style={{
                filter: `drop-shadow(0 0 30px ${colors.glow})`,
              }}
            />

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              }}
            />
          </motion.div>

          {/* Loading text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2"
          >
            <p className="text-sm font-mono font-bold tracking-widest uppercase" style={{ color: colors.bottomRight }}>
              Loading...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
