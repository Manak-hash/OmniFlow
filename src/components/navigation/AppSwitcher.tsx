import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, Keyboard, ArrowRight } from 'lucide-react'
import { useTransitionTrigger } from '@/contexts/TransitionContext'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { cn } from '@/utils/cn'

interface AppSwitcherProps {
  className?: string
  variant?: 'sidebar' | 'header' | 'card'
  showShortcutHint?: boolean
}

export function AppSwitcher({
  className = '',
  variant = 'sidebar',
  showShortcutHint = true,
}: AppSwitcherProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { triggerTransition } = useTransitionTrigger()

  const handleSwitch = async () => {
    // Navigate to the REAL OmniToys app
    const isDev = import.meta.env.DEV
    let omniToysUrl: string

    if (isDev) {
      // In dev, detect ports dynamically
      const currentPort = parseInt(window.location.port)
      // OmniFlow (even port) → OmniToys (odd port)
      const omniToysPort = currentPort % 2 === 0 ? currentPort - 1 : currentPort - 2
      omniToysUrl = `http://localhost:${omniToysPort}`
    } else {
      omniToysUrl = '/' // Same domain, navigate to root
    }

    triggerTransition(omniToysUrl)
  }

  // Keyboard shortcut: Cmd+Shift+O
  useKeyboardShortcut(['o'], () => {
    handleSwitch()
  }, { shift: true, meta: true, ctrl: true })

  // Header variant - ultra compact icon button
  if (variant === 'header') {
    return (
      <motion.button
        onClick={handleSwitch}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'relative p-2 rounded-lg transition-all duration-300 group overflow-hidden',
          'text-omni-text-secondary hover:text-omni-primary',
          'hover:bg-omni-primary/10'
        )}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          animate={{
            background: [
              'radial-gradient(circle at center, rgba(223, 28, 38, 0.1) 0%, transparent 70%)',
              'radial-gradient(circle at center, rgba(223, 28, 38, 0.15) 0%, transparent 70%)',
              'radial-gradient(circle at center, rgba(223, 28, 38, 0.1) 0%, transparent 70%)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Icon */}
        <motion.div
          animate={{ rotate: isHovered ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10"
        >
          <Shuffle className="w-4 h-4" />
        </motion.div>

        {/* Tooltip */}
        <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900/95 backdrop-blur-md text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-white/10 z-50">
          <div className="font-medium">Switch to OmniToys</div>
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5 font-mono">
            <Keyboard className="w-3 h-3" />
            <span>⌘⇧O</span>
          </div>
        </div>
      </motion.button>
    )
  }

  // Sidebar variant - clean and minimal
  if (variant === 'sidebar') {
    return (
      <motion.button
        onClick={handleSwitch}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-lg',
          'text-xs font-semibold text-omni-text-secondary',
          'hover:text-omni-primary hover:bg-omni-primary/10',
          'transition-all group border border-transparent hover:border-omni-primary/20',
          'w-full text-left relative overflow-hidden',
          className
        )}
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: isHovered ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-4 h-4 flex items-center justify-center text-omni-text-secondary group-hover:text-omni-primary transition-all"
        >
          <Shuffle className="w-4 h-4" />
        </motion.div>

        {/* Text */}
        <span className="tracking-tight flex-1">Switch to OmniToys</span>

        {/* Keyboard hint */}
        {showShortcutHint && (
          <div className="text-[9px] text-omni-text-tertiary font-mono opacity-0 group-hover:opacity-60 transition-opacity">
            ⌘⇧O
          </div>
        )}
      </motion.button>
    )
  }

  // Card variant
  return (
    <div className={cn('relative', className)}>
      <motion.button
        onClick={handleSwitch}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'flex items-center rounded-lg transition-all duration-300 group relative overflow-hidden w-full',
          'px-6 py-4 gap-4 bg-gradient-to-r from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 border border-white/10'
        )}
      >
        {/* Subtle animated shimmer */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent)',
          }}
        />

        {/* Icon container with refined animation */}
        <motion.div
          animate={{
            rotate: isHovered ? 180 : 0,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-omni-primary/20 to-omni-primary/5 text-omni-primary"
        >
          <Shuffle className="w-5 h-5" />
        </motion.div>

        {/* Text content - cleaner typography */}
        <div className="flex-1 text-left relative z-10">
          <p className="text-sm font-semibold text-omni-text group-hover:text-white transition-colors leading-tight">
            Switch to OmniToys
          </p>
          {showShortcutHint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.2 }}
              className="text-[11px] text-omni-text-secondary font-mono mt-1 flex items-center gap-1.5"
            >
              <Keyboard className="w-3 h-3" />
              <span>⌘⇧O</span>
            </motion.p>
          )}
        </div>

        {/* Arrow indicator */}
        <motion.div
          animate={{ x: isHovered ? 4 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-omni-text-secondary group-hover:text-omni-primary transition-colors relative z-10"
        >
          <ArrowRight className="w-4 h-4" />
        </motion.div>

        {/* Refined glow effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-lg blur-xl -z-10"
              style={{
                background: 'radial-gradient(circle at center, rgba(223, 28, 38, 0.15) 0%, transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
