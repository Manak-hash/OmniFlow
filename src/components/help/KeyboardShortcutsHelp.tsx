import { STATE_CONFIGS } from '@/constants/states'
import { KeyRound } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ShortcutItem {
  key: string
  description: string
  category: string
}

const SHORTCUTS: ShortcutItem[] = [
  // Task Management
  { key: 'N', description: 'Create new task', category: 'Task Management' },
  { key: 'E', description: 'Edit selected task', category: 'Task Management' },
  { key: 'Delete / Backspace', description: 'Delete selected task', category: 'Task Management' },
  { key: 'Escape', description: 'Close panel / clear selection', category: 'Task Management' },

  // Navigation
  { key: '↑ / ↓', description: 'Navigate tasks', category: 'Navigation' },
  { key: 'Home / End', description: 'Jump to first/last task', category: 'Navigation' },
  { key: 'Enter', description: 'Edit focused task', category: 'Navigation' },

  // View Modes
  { key: 'L', description: 'Switch to list view', category: 'View Modes' },
  { key: 'K', description: 'Switch to kanban view', category: 'View Modes' },

  // Search
  { key: 'Ctrl+K', description: 'Open search', category: 'Search' },

  // Help
  { key: '?', description: 'Show this help', category: 'Help' }
]

const CATEGORIES = ['Task Management', 'Navigation', 'View Modes', 'Search', 'Help']

export function KeyboardShortcutsHelp() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-omni-primary/10 mb-4">
          <KeyRound className="w-8 h-8 text-omni-primary" />
        </div>
        <h2 className="text-2xl font-bold text-omni-text mb-2">Keyboard Shortcuts</h2>
        <p className="text-sm text-omni-text-secondary">
          Power through your tasks without touching the mouse
        </p>
      </div>

      {/* Shortcuts by Category */}
      {CATEGORIES.map((category) => {
        const categoryShortcuts = SHORTCUTS.filter(s => s.category === category)

        return (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold text-omni-text uppercase tracking-wide">
              {category}
            </h3>
            <div className="space-y-2">
              {categoryShortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between p-3 bg-omni-bg rounded-lg border border-omni-border"
                >
                  <div className="flex items-center gap-3">
                    <kbd className="px-3 py-1.5 bg-omni-bg-secondary border border-omni-text/20 rounded text-sm font-mono text-omni-text">
                      {shortcut.key}
                    </kbd>
                    <span className="text-omni-text">{shortcut.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* State Shortcuts */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-omni-text uppercase tracking-wide">
          Task States
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(STATE_CONFIGS).map(([state, config]) => {
            const Icon = config.icon
            return (
              <div
                key={state}
                className="flex items-center gap-2 p-2 bg-omni-bg rounded-lg border border-omni-border"
              >
                <Icon className={cn(
                  'w-4 h-4',
                  `text-${config.color}-400`
                )} />
                <span className="text-sm text-omni-text">{config.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-omni-border">
        <p className="text-xs text-omni-text-secondary">
          Press <kbd className="px-2 py-1 bg-omni-bg-secondary border border-omni-text/20 rounded text-xs font-mono">Escape</kbd> or <kbd className="px-2 py-1 bg-omni-bg-secondary border border-omni-text/20 rounded text-xs font-mono">?</kbd> to close
        </p>
      </div>
    </div>
  )
}
