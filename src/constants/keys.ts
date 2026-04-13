/**
 * Keyboard shortcut configuration
 * Maps keyboard commands to their descriptions and key combinations
 */

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  category: 'navigation' | 'actions' | 'views' | 'help'
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  {
    key: 'n',
    description: 'Create new task',
    category: 'actions'
  },
  {
    key: 'e',
    description: 'Edit selected task',
    category: 'actions'
  },
  {
    key: 'Escape',
    description: 'Close panel or clear selection',
    category: 'navigation'
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts',
    category: 'help'
  },
  {
    key: 'k',
    ctrlKey: true,
    description: 'Focus search',
    category: 'navigation'
  },
  {
    key: 'ArrowUp',
    description: 'Navigate up',
    category: 'navigation'
  },
  {
    key: 'ArrowDown',
    description: 'Navigate down',
    category: 'navigation'
  },
  {
    key: 'Home',
    description: 'Go to first item',
    category: 'navigation'
  },
  {
    key: 'End',
    description: 'Go to last item',
    category: 'navigation'
  },
  {
    key: 'Enter',
    description: 'Open selected item',
    category: 'navigation'
  },
  {
    key: 'l',
    description: 'Switch to list view',
    category: 'views'
  },
  {
    key: 'b',
    description: 'Switch to kanban board',
    category: 'views'
  }
]

/**
 * Check if a keyboard event matches a shortcut
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  return (
    event.key === shortcut.key &&
    !!event.ctrlKey === !!shortcut.ctrlKey &&
    !!event.shiftKey === !!shortcut.shiftKey &&
    !!event.altKey === !!shortcut.altKey &&
    !!event.metaKey === !!shortcut.metaKey
  )
}

/**
 * Format shortcut key for display
 */
export function formatShortcutKey(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.metaKey) parts.push('Cmd')
  if (shortcut.shiftKey) parts.push('Shift')
  if (shortcut.altKey) parts.push('Alt')
  parts.push(shortcut.key)

  return parts.join(' + ')
}

/**
 * Get shortcut by key
 */
export function getShortcutByKey(_key: string, event: KeyboardEvent): KeyboardShortcut | undefined {
  return KEYBOARD_SHORTCUTS.find(shortcut => matchesShortcut(event, shortcut))
}
