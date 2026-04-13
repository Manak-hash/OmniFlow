import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Theme } from '@/utils/themes'
import { usePreferences } from '@/store/preferences'
import { ThemeCard } from './ThemeSelector'

interface ThemeCategoryGroupProps {
  category: {
    id: string
    name: string
    icon: React.ElementType
    count: number
  }
  themes: Theme[]
  defaultExpanded?: boolean
}

export function ThemeCategoryGroup({
  category,
  themes,
  defaultExpanded = true
}: ThemeCategoryGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const { theme: activeThemeId, setTheme } = usePreferences()
  const { icon: Icon } = category

  // Persist state
  useEffect(() => {
    const key = `theme-category-${category.id}`
    const saved = localStorage.getItem(key)
    if (saved !== null) {
      setIsExpanded(JSON.parse(saved))
    }
  }, [category.id])

  const handleToggle = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    localStorage.setItem(`theme-category-${category.id}`, JSON.stringify(newState))
  }

  return (
    <div className="space-y-2">
      {/* Category header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 rounded-lg
          bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04]
          transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-omni-primary" />
          <span className="text-sm font-semibold text-omni-text">{category.name}</span>
          <span className="text-xs text-omni-text/30">
            {category.count} theme{category.count !== 1 ? 's' : ''}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-omni-text/30"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Theme grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pl-2">
              {themes.map((theme, index) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={theme.id === activeThemeId}
                  onClick={() => setTheme(theme.id)}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
