import { MessageCircle } from 'lucide-react'
import { Comments } from './Comments'
import { CommentForm } from './CommentForm'
import { useCommentStore } from '@/services/comments'
import { cn } from '@/utils/cn'

interface CommentsPanelProps {
  nodeId: string
  className?: string
}

export function CommentsPanel({ nodeId, className }: CommentsPanelProps) {
  const { getCommentsForNode } = useCommentStore()
  const comments = getCommentsForNode(nodeId)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h3>
        </div>
      </div>

      {/* Comments List */}
      <Comments nodeId={nodeId} />

      {/* New Comment Form */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <CommentForm
          nodeId={nodeId}
          onCancel={() => {}}
          onComplete={() => {}}
        />
      </div>
    </div>
  )
}
