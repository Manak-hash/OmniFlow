import { useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { KEYBOARD_SHORTCUTS, matchesShortcut, formatShortcutKey, type KeyboardShortcut } from '@/constants/keys'

interface ShortcutHandlers {
  onNewTask?: () => void
  onEdit?: () => void
  onClose?: () => void
  onShowHelp?: () => void
  onSearch?: () => void
  onListView?: () => void
  onKanbanView?: () => void
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean
  ignoreInputElements?: boolean
}

// Old API for backward compatibility
type LegacyShortcuts = Record<string, (e: KeyboardEvent) => void>

/**
 * Hook for handling keyboard shortcuts
 *
 * New API (recommended):
 * useKeyboardShortcuts({ onNewTask, onEdit, onClose, ... })
 *
 * Old API (backward compatible):
 * useKeyboardShortcuts({ 'ctrl+n': handler, 'escape': handler })
 */
export function useKeyboardShortcuts(
  handlers: ShortcutHandlers | LegacyShortcuts,
  options: UseKeyboardShortcutsOptions = {}
) {
  const {
    enabled = true,
    ignoreInputElements = true
  } = options

  // Detect if using old or new API
  const isLegacyAPI = useCallback((h: ShortcutHandlers | LegacyShortcuts): h is LegacyShortcuts => {
    const keys = Object.keys(h)
    // Check if any key contains '+' or is a known legacy format
    return keys.some(key => key.includes('+') || key === 'ctrl+n' || key === 'meta+n' || key === 'escape')
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Ignore if typing in input/textarea
    if (ignoreInputElements) {
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }
    }

    // Handle legacy API (old format with 'ctrl+n', 'meta+n', etc.)
    if (isLegacyAPI(handlers)) {
      const key = [
        event.ctrlKey && 'ctrl',
        event.metaKey && 'meta',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
        event.key.toLowerCase()
      ].filter(Boolean).join('+')

      const callback = (handlers as LegacyShortcuts)[key]
      if (callback) {
        event.preventDefault()
        callback(event)
      }
      return
    }

    // Handle new API (structured handlers)
    const shortcut = KEYBOARD_SHORTCUTS.find(s => matchesShortcut(event, s))

    if (!shortcut) return

    const typedHandlers = handlers as ShortcutHandlers

    // Execute handler
    switch (shortcut.key) {
      case 'n':
        event.preventDefault()
        if (typedHandlers.onNewTask) typedHandlers.onNewTask()
        toast('New task (Press N)', { id: 'shortcut-new-task' })
        break

      case 'e':
        event.preventDefault()
        if (typedHandlers.onEdit) typedHandlers.onEdit()
        toast('Edit task (Press E)', { id: 'shortcut-edit' })
        break

      case 'Escape':
        event.preventDefault()
        if (typedHandlers.onClose) typedHandlers.onClose()
        // Don't show toast for Escape - it's too common
        break

      case '?':
        event.preventDefault()
        if (typedHandlers.onShowHelp) typedHandlers.onShowHelp()
        toast('Keyboard shortcuts (Press ?)', { id: 'shortcut-help' })
        break

      case 'k':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          if (typedHandlers.onSearch) typedHandlers.onSearch()
          toast('Search focused (Ctrl+K)', { id: 'shortcut-search' })
        }
        break

      case 'l':
        event.preventDefault()
        if (typedHandlers.onListView) typedHandlers.onListView()
        toast('List view (Press L)', { id: 'shortcut-list' })
        break

      case 'b':
        event.preventDefault()
        if (typedHandlers.onKanbanView) typedHandlers.onKanbanView()
        toast('Kanban view (Press B)', { id: 'shortcut-kanban' })
        break
    }
  }, [enabled, ignoreInputElements, handlers, isLegacyAPI])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    shortcuts: KEYBOARD_SHORTCUTS,
    formatShortcutKey
  }
}

/**
 * Hook to show keyboard shortcuts help modal
 */
export function useKeyboardShortcutsHelp() {
  const showHelp = useCallback(() => {
    const shortcutsByCategory = KEYBOARD_SHORTCUTS.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = []
      }
      acc[shortcut.category].push(shortcut)
      return acc
    }, {} as Record<string, KeyboardShortcut[]>)

    const categoryTitles: Record<string, string> = {
      navigation: 'Navigation',
      actions: 'Actions',
      views: 'Views',
      help: 'Help'
    }

    // Create help message
    let message = 'Keyboard Shortcuts:\n\n'

    Object.entries(shortcutsByCategory).forEach(([category, shortcuts]) => {
      message += `${categoryTitles[category] || category}:\n`
      shortcuts.forEach(shortcut => {
        message += `  ${formatShortcutKey(shortcut)} - ${shortcut.description}\n`
      })
      message += '\n'
    })

    toast.info(message, {
      duration: 10000,
      id: 'keyboard-shortcuts-help'
    })
  }, [])

  return { showHelp }
}
