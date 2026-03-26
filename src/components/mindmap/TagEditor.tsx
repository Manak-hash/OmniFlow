import { useState, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { TagBadge } from './TagBadge'
import { filterTags, sortTags, isValidTag, normalizeTag } from '@/utils/tags'
import { cn } from '@/utils/cn'

interface TagEditorProps {
  tags: string[]
  allTags: string[]
  onChange: (tags: string[]) => void
  maxSuggestions?: number
  className?: string
  disabled?: boolean
}

export function TagEditor({
  tags,
  allTags,
  onChange,
  maxSuggestions = 10,
  className,
  disabled = false
}: TagEditorProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = sortTags(
    filterTags(allTags, input)
      .filter(tag => !tags.includes(tag))
      .slice(0, maxSuggestions)
  )

  const handleAddTag = (tagToAdd: string) => {
    if (disabled) return
    const normalized = normalizeTag(tagToAdd)
    if (!isValidTag(normalized)) return
    if (tags.includes(normalized)) return

    onChange([...tags, normalized])
    setInput('')
    setShowSuggestions(false)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    if (disabled) return
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      handleAddTag(input.trim())
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      // Remove last tag when backspacing on empty input
      handleRemoveTag(tags[tags.length - 1])
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Current Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <div
              key={tag}
              className="flex items-center gap-1 bg-gray-700 rounded-full pl-2 pr-1 py-0.5"
            >
              <TagBadge tag={tag} size="sm" />
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-gray-400 hover:text-white transition-colors"
                title={`Remove ${tag}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tag Input */}
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => {
            if (disabled) return
            setInput(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => !disabled && setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow clicking suggestions
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            tags.length === 0
              ? 'Add tags... (press Enter)'
              : 'Add more tags...'
          }
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map(tag => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors"
              >
                <TagBadge tag={tag} size="sm" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400">
        Press Enter to add a tag. Click × to remove.
      </p>
    </div>
  )
}
