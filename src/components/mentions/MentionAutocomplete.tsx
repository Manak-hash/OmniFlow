import { useMemo, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'

interface User {
  id: string
  name: string
  avatar?: string
}

interface MentionAutocompleteProps {
  query: string
  users: User[]
  onSelect: (user: User) => void
  position: { top: number; left: number }
  className?: string
}

export function MentionAutocomplete({
  query,
  users,
  onSelect,
  position,
  className
}: MentionAutocompleteProps) {
  const filteredUsers = useMemo(() => {
    if (!query) return users.slice(0, 5)

    const lowerQuery = query.toLowerCase()
    return users
      .filter(user => user.name.toLowerCase().includes(lowerQuery))
      .slice(0, 5)
  }, [query, users])

  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Parent should handle closing
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (filteredUsers.length === 0) {
    return (
      <div
        ref={menuRef}
        className={cn(
          'absolute z-50 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3',
          className
        )}
        style={{ top: position.top, left: position.left }}
      >
        <div className="text-sm text-gray-400 text-center">
          {query ? 'No users found' : 'Type to search users...'}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute z-50 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden',
        className
      )}
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-1">
        {filteredUsers.map((user, index) => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
              'hover:bg-gray-700 active:bg-gray-600',
              index === 0 && 'bg-gray-700/50'
            )}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="flex-1 text-left text-sm font-medium">{user.name}</span>
            <span className="text-xs text-gray-400">@{user.name.toLowerCase().replace(/\s/g, '')}</span>
          </button>
        ))}
      </div>

      {/* Keyboard hint */}
      <div className="px-3 py-2 bg-gray-900/50 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Use ↑↓ to navigate, Enter to select
        </p>
      </div>
    </div>
  )
}
