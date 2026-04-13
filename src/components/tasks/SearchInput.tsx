import { Search, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { useEffect, useRef } from 'react'

export function SearchInput({ className }: { className?: string }) {
  const searchQuery = useUIStore((state) => state.searchQuery)
  const setSearchQuery = useUIStore((state) => state.setSearchQuery)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when Ctrl+K is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-omni-text-secondary pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search tasks... (Ctrl+K)"
        className={cn(
          'w-full pl-10 pr-10 py-2',
          'bg-omni-bg border border-omni-border rounded-lg',
          'text-omni-text placeholder:text-omni-text-secondary',
          'focus:outline-none focus:ring-2 focus:ring-omni-primary/50',
          'transition-all'
        )}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-omni-text-secondary hover:text-omni-text transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
