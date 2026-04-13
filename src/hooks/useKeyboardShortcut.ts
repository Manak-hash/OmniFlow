import { useEffect } from 'react'

interface Options {
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
}

export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  options: Options = {}
) {
  const { ctrl = false, meta = false, shift = false } = options

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl key matches requirement (treat Cmd as Ctrl on Mac)
      const ctrlMatch = ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey

      // Check if Meta key matches requirement
      const metaMatch = meta ? e.metaKey : true

      // Check if Shift key matches requirement
      const shiftMatch = shift ? e.shiftKey : true

      // Check if the pressed key is in our allowed keys array
      const keyMatch = keys.includes(e.key)

      // If all conditions are met, prevent default and execute callback
      if (ctrlMatch && metaMatch && shiftMatch && keyMatch) {
        e.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Cleanup: remove event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [keys, callback, ctrl, meta, shift])
}
