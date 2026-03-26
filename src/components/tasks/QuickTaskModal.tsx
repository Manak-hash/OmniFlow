import { useState, useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { StateSelector } from '@/components/mindmap/StateSelector'
import { TagBadge } from '@/components/mindmap/TagBadge'
import type { TaskState } from '@/types/node'
import { X, Plus } from 'lucide-react'

interface QuickTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: {
    title: string
    content: string
    state: TaskState | null
    tags: string[]
    parentId: string | null
  }) => void
  defaultState?: TaskState | null
  defaultTags?: string[]
  allTags?: string[]
  parentNodeTitle?: string
}

export function QuickTaskModal({
  isOpen,
  onClose,
  onCreate,
  defaultState = null,
  defaultTags = [],
  allTags = [],
  parentNodeTitle
}: QuickTaskModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [state, setState] = useState<TaskState | null>(defaultState)
  const [tags, setTags] = useState<string[]>(defaultTags)
  const [tagInput, setTagInput] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Focus title input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setContent('')
      setState(defaultState)
      setTags(defaultTags)
      setTagInput('')
    }
  }, [isOpen, defaultState, defaultTags])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      titleInputRef.current?.focus()
      return
    }

    onCreate({
      title: title.trim(),
      content: content.trim(),
      state,
      tags,
      parentId: null // Will be set by parent component
    })

    // Reset and close
    setTitle('')
    setContent('')
    onClose()
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Add Task">
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="space-y-4">
          {/* Parent node hint */}
          {parentNodeTitle && (
            <div className="text-sm text-omni-text-secondary">
              Parent: <span className="font-medium text-omni-text">{parentNodeTitle}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <Input
              ref={titleInputRef}
              label="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-sm font-medium text-omni-text mb-2">
              Description <span className="text-omni-text-tertiary">(optional)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-3 py-2 bg-omni-bg border border-omni-border rounded-lg text-omni-text placeholder:text-omni-text-tertiary focus:outline-none focus:border-omni-primary resize-none"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-omni-text mb-2">
              State <span className="text-omni-text-tertiary">(optional)</span>
            </label>
            <StateSelector
              value={state}
              onChange={setState}
              size="sm"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-omni-text mb-2">
              Tags <span className="text-omni-text-tertiary">(optional)</span>
            </label>

            {/* Selected tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-omni-bg border border-omni-border text-omni-text text-sm"
                  >
                    <TagBadge tag={tag} size="sm" />
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-omni-primary transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag input */}
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Add tag..."
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-omni-bg border border-omni-border rounded-lg hover:border-omni-text-tertiary transition-colors"
                title="Add tag"
              >
                <Plus className="w-4 h-4 text-omni-text-secondary" />
              </button>
            </div>

            {/* Tag suggestions */}
            {tagInput && allTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {allTags
                  .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag))
                  .slice(0, 5)
                  .map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setTags([...tags, tag])
                        setTagInput('')
                      }}
                      className="text-xs px-2 py-1 bg-omni-bg-secondary border border-omni-border rounded hover:border-omni-primary transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Keyboard hint */}
          <div className="text-xs text-omni-text-tertiary">
            Press <kbd className="px-1.5 py-0.5 bg-omni-bg border border-omni-border rounded">⌘ + Enter</kbd> to submit
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-omni-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  )
}
