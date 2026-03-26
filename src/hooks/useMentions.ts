import { useState, useCallback, useRef } from 'react'
import { isCursorInMention, getMentionQuery, insertMention } from '@/utils/mentions'

interface User {
  id: string
  name: string
  avatar?: string
}

interface UseMentionsOptions {
  users: User[]
  onMention?: (username: string) => void
}

export function useMentions({ users: _users, onMention }: UseMentionsOptions) {
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState<string>('')
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [cursorPosition, setCursorPosition] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showMentions) return

    // TODO: Handle arrow keys and enter for navigation
    if (e.key === 'Escape') {
      setShowMentions(false)
      e.preventDefault()
    }
  }, [showMentions])

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string
  ) => {
    const target = e.target
    const position = target.selectionStart || 0

    setCursorPosition(position)

    // Check if cursor is in a mention
    if (isCursorInMention(value, position)) {
      const query = getMentionQuery(value, position)

      // Calculate position for autocomplete menu
      if (containerRef.current && textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()

        // Approximate cursor position (this is a simplification)
        const top = rect.bottom - containerRect.top + 4
        const left = rect.left - containerRect.left

        setMentionPosition({ top, left })
      }

      setMentionQuery(query || '')
      setShowMentions(true)
    } else {
      setShowMentions(false)
      setMentionQuery('')
    }
  }, [])

  const handleSelectMention = useCallback((user: User, value: string, onChange: (newValue: string) => void) => {
    const newValue = insertMention(value, cursorPosition, user.name)
    onChange(newValue)
    setShowMentions(false)
    setMentionQuery('')
    onMention?.(user.name)
  }, [cursorPosition, onMention])

  return {
    showMentions,
    mentionQuery,
    mentionPosition,
    containerRef,
    textareaRef,
    handleKeyDown,
    handleInputChange,
    handleSelectMention,
    setShowMentions
  }
}
