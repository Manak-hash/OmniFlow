import { themes, getThemeById, applyTheme, type Theme } from '@/utils/themes'
import { Check, Palette, Zap, Cpu, Gamepad2, Briefcase, Leaf, FlaskConical } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePreferences } from '@/store/preferences'
import { useEffect } from 'react'

export interface ThemeCardProps {
  theme: Theme
  isActive: boolean
  onClick: () => void
  index: number
}

export function ThemeCard({ theme, isActive, onClick, index }: ThemeCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`relative group w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
        isActive
          ? 'border-omni-primary shadow-lg shadow-omni-primary/20 scale-[1.02]'
          : 'border-white/5 hover:border-white/10 hover:scale-[1.01]'
      }`}
      style={{
        background: `linear-gradient(135deg, ${theme.preview.bg} 0%, ${theme.preview.bg}dd 100%)`,
      }}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-omni-primary rounded-full flex items-center justify-center shadow-lg z-10"
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.div>
      )}

      {/* Preview circles */}
      <div className="flex items-center gap-2 mb-3">
        {[
          theme.preview.bg,
          theme.preview.text,
          theme.preview.accent,
          theme.preview.glow,
        ].map((color, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full border-2 border-white/10 shadow-inner"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Theme info */}
      <div className="space-y-1">
        <h4
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: theme.preview.text }}
        >
          {theme.name}
        </h4>
        <p
          className="text-xs leading-relaxed opacity-60 line-clamp-2"
          style={{ color: theme.preview.text }}
        >
          {theme.description}
        </p>
      </div>

      {/* Accessibility badges */}
      <div className="flex items-center gap-2 mt-2">
        {/* WCAG badge */}
        {theme.accessibility.wcagLevel !== 'fail' && (
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
              theme.accessibility.wcagLevel === 'AAA'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}
          >
            {theme.accessibility.wcagLevel}
          </span>
        )}

        {/* Contrast ratio */}
        <span className="text-[10px] font-mono opacity-50">
          {theme.accessibility.contrastRatio.toFixed(1)}:1
        </span>
      </div>

      {/* Colorblind icons */}
      <div className="flex gap-1 mt-1.5">
        {theme.accessibility.colorblindSafe.deuteranopia && (
          <span
            className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-[8px]"
            title="Safe for deuteranopia (red-green)"
          >
            🟢
          </span>
        )}
        {theme.accessibility.colorblindSafe.protanopia && (
          <span
            className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[8px]"
            title="Safe for protanopia (red-green)"
          >
            🔴
          </span>
        )}
        {theme.accessibility.colorblindSafe.tritanopia && (
          <span
            className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[8px]"
            title="Safe for tritanopia (blue-yellow)"
          >
            🔵
          </span>
        )}
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${theme.preview.glow} 0%, transparent 70%)`,
        }}
      />
    </motion.button>
  )
}

const themeCategories = [
  { id: 'cyberpunk' as const, name: 'Cyberpunk', icon: Zap },
  { id: 'retro' as const, name: 'Retro Computing', icon: Cpu },
  { id: 'gaming' as const, name: 'Gaming', icon: Gamepad2 },
  { id: 'professional' as const, name: 'Professional', icon: Briefcase },
  { id: 'nature' as const, name: 'Nature & Organic', icon: Leaf },
  { id: 'experimental' as const, name: 'Experimental', icon: FlaskConical },
]

export function ThemeSelector() {
  const { theme: activeThemeId, setTheme } = usePreferences()

  // Apply theme on mount and when changed
  useEffect(() => {
    const theme = getThemeById(activeThemeId)
    applyTheme(theme)
  }, [activeThemeId])

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-omni-primary/20 to-omni-accent/20 border border-omni-primary/20 flex items-center justify-center">
          <Palette className="w-4 h-4 text-omni-primary" />
        </div>
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-omni-text/30">
            Theme Selection
          </h3>
          <p className="text-[10px] text-omni-text/20 mt-0.5">
            Choose your laboratory aesthetic
          </p>
        </div>
      </div>

      {/* Category groups */}
      <div className="space-y-3">
        {themeCategories.map(category => {
          const categoryThemes = themes.filter(t => t.category === category.id)
          if (categoryThemes.length === 0) return null

          return (
            <div key={category.id} className="space-y-2">
              {/* Category header */}
              <div className="flex items-center gap-2 px-2">
                <category.icon className="w-4 h-4 text-omni-primary" />
                <span className="text-sm font-semibold text-omni-text">{category.name}</span>
                <span className="text-xs text-omni-text/30">
                  {categoryThemes.length} theme{categoryThemes.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Theme grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {categoryThemes.map((theme, index) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={theme.id === activeThemeId}
                    onClick={() => handleThemeChange(theme.id)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
