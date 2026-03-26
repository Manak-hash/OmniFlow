import { useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { Button } from '@/components/ui/Button'
import { getReplicache } from '@/store/replicache'
import type { Comment } from '@/types/comment'

interface CommentFormProps {
  nodeId: string
  commentId?: string // If editing
  parentId?: string // If replying
  initialContent?: string
  onCancel: () => void
  onComplete: () => void
}

const CURRENT_USER_ID = 'local-user'
const CURRENT_USER_NAME = 'You'

export function CommentForm({
  nodeId,
  commentId,
  parentId,
  initialContent = '',
  onCancel,
  onComplete
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const replicache = getReplicache()

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()

      if (commentId) {
        // Update existing comment
        await replicache.mutate.updateComment({
          id: commentId,
          updates: { content: content.trim() }
        })
      } else {
        // Create new comment
        const newComment: Comment = {
          id: crypto.randomUUID(),
          nodeId,
          parentId: parentId || null,
          userId: CURRENT_USER_ID,
          userName: CURRENT_USER_NAME,
          content: content.trim(),
          createdAt: now,
          updatedAt: now,
          edited: false
        }

        await replicache.mutate.createComment(newComment)
      }

      setContent('')
      onComplete()
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-2">
      <CodeMirror
        value={content}
        onChange={setContent}
        onKeyDown={handleKeyDown}
        placeholder="Write a comment... (Markdown supported, Ctrl+Enter to submit)"
        height="100px"
        extensions={[markdown()]}
        className="bg-gray-900 rounded-lg"
      />

      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting
            ? 'Submitting...'
            : commentId
              ? 'Update'
              : parentId
                ? 'Reply'
                : 'Comment'
          }
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        Tip: Press Ctrl+Enter to submit
      </p>
    </div>
  )
}
