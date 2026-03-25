import { useEffect } from 'react'

export function useKeyboardShortcuts(
  shortcuts: Record<string, (e: KeyboardEvent) => void>
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.metaKey && 'meta',
        e.shiftKey && 'shift',
        e.altKey && 'alt',
        e.key.toLowerCase()
      ].filter(Boolean).join('+')

      const callback = shortcuts[key]
      if (callback) {
        e.preventDefault()
        callback(e)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts])
}
