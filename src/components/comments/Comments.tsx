import { useState } from 'react'
import { MessageCircle, Reply, Trash2, Edit2 } from 'lucide-react'
import { useCommentStore } from '@/services/comments'
import { getReplicache } from '@/store/replicache'
import type { CommentWithReplies } from '@/types/comment'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'
import { CommentForm } from './CommentForm'
import { UserMention } from '@/components/mentions/UserMention'
import ReactMarkdown from 'react-markdown'

interface CommentsProps {
  nodeId: string
  className?: string
}

export function Comments({ nodeId, className }: CommentsProps) {
  const { getThreadedComments } = useCommentStore()
  const comments = getThreadedComments(nodeId)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const handleReplyComplete = () => {
    setReplyingTo(null)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No comments yet. Start the conversation!</p>
        </div>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replyingTo={replyingTo}
            onReply={setReplyingTo}
            onReplyComplete={handleReplyComplete}
          />
        ))
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: CommentWithReplies
  depth?: number
  replyingTo: string | null
  onReply: (commentId: string | null) => void
  onReplyComplete: () => void
}

function CommentItem({
  comment,
  depth = 0,
  replyingTo,
  onReply,
  onReplyComplete
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [replicache, setReplicache] = useState<any>(null)
  const maxDepth = 5 // Maximum nesting level

  useState(() => {
    getReplicache().then(setReplicache)
  })

  const handleDelete = async () => {
    if (!replicache) return
    if (confirm('Delete this comment?')) {
      await replicache.mutate.deleteComment(comment.id)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })

  return (
    <div
      className={cn('relative', depth > 0 && 'ml-8 pl-4 border-l-2 border-gray-700')}
      style={{ marginLeft: `${depth * 16}px` }}
    >
      {/* Comment */}
      {!isEditing ? (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* User avatar or initial */}
              {comment.userAvatar ? (
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="font-medium text-sm text-text">{comment.userName}</span>
                <span className="text-xs text-gray-400 ml-2">{timeAgo}</span>
                {comment.edited && (
                  <span className="text-xs text-gray-500 ml-1">(edited)</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {depth < maxDepth && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                  title="Reply"
                >
                  <Reply className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                title="Edit"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-white transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => {
                  const text = String(children)
                  // Check if content contains markdown, if so use regular rendering
                  if (text.includes('**') || text.includes('*') || text.includes('#') || text.includes('[')) {
                    return <p>{children}</p>
                  }
                  // For plain text, use UserMention component
                  return <p><UserMention content={text} /></p>
                }
              }}
            >
              {comment.content}
            </ReactMarkdown>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <CommentForm
                nodeId={comment.nodeId}
                parentId={comment.id}
                onCancel={() => onReply(null)}
                onComplete={onReplyComplete}
              />
            </div>
          )}
        </div>
      ) : (
        /* Edit Form */
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <CommentForm
            nodeId={comment.nodeId}
            commentId={comment.id}
            initialContent={comment.content}
            onCancel={() => setIsEditing(false)}
            onComplete={() => setIsEditing(false)}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              replyingTo={replyingTo}
              onReply={onReply}
              onReplyComplete={onReplyComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
