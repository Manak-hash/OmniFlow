export interface Comment {
  id: string
  nodeId: string
  parentId: string | null // For threaded replies
  userId: string
  userName: string
  userAvatar?: string
  content: string // Markdown content
  createdAt: string
  updatedAt: string
  edited: boolean
}

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[]
}
