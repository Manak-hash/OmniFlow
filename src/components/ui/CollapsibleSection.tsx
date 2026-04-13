import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CollapsibleSectionProps {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  className = ''
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Persist state in localStorage
  useEffect(() => {
    const key = `collapsible-${title}`
    const saved = localStorage.getItem(key)
    if (saved !== null) {
      setIsOpen(JSON.parse(saved))
    }
  }, [title])

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem(`collapsible-${title}`, JSON.stringify(newState))
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 rounded-xl
          bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04]
          transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-omni-primary/20
              to-omni-accent/20 border border-omni-primary/20 flex items-center justify-center">
              <Icon className="w-4 h-4 text-omni-primary" />
            </div>
          )}
          <div className="text-left">
            <h3 className="text-xs font-black uppercase tracking-widest text-omni-text/30">
              {title}
            </h3>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-omni-text/30"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
