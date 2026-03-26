import { create } from 'zustand'
import type { Comment, CommentWithReplies } from '@/types/comment'

interface CommentState {
  comments: Map<string, Comment>

  // Actions
  setComments: (comments: Comment[]) => void
  addComment: (comment: Comment) => void
  updateComment: (id: string, updates: Partial<Comment>) => void
  deleteComment: (id: string) => void
  getCommentsForNode: (nodeId: string) => Comment[]
  getThreadedComments: (nodeId: string) => CommentWithReplies[]
  clearComments: () => void
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: new Map(),

  setComments: (comments: Comment[]) => {
    const commentMap = new Map()
    comments.forEach(comment => {
      commentMap.set(comment.id, comment)
    })
    set({ comments: commentMap })
  },

  addComment: (comment: Comment) => {
    set((state) => {
      const newComments = new Map(state.comments)
      newComments.set(comment.id, comment)
      return { comments: newComments }
    })
  },

  updateComment: (id: string, updates: Partial<Comment>) => {
    set((state) => {
      const existing = state.comments.get(id)
      if (!existing) return state

      const newComments = new Map(state.comments)
      newComments.set(id, {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
        edited: true
      })
      return { comments: newComments }
    })
  },

  deleteComment: (id: string) => {
    set((state) => {
      const newComments = new Map(state.comments)
      newComments.delete(id)
      return { comments: newComments }
    })
  },

  getCommentsForNode: (nodeId: string) => {
    const state = get()
    const nodeComments: Comment[] = []

    state.comments.forEach((comment) => {
      if (comment.nodeId === nodeId) {
        nodeComments.push(comment)
      }
    })

    return nodeComments.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  },

  getThreadedComments: (nodeId: string) => {
    const comments = get().getCommentsForNode(nodeId)
    const commentMap = new Map(comments.map(c => [c.id, { ...c, replies: [] as any }]))
    const rootComments: CommentWithReplies[] = []

    comments.forEach((comment) => {
      const threaded = commentMap.get(comment.id)!
      if (comment.parentId === null) {
        rootComments.push(threaded)
      } else {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies.push(threaded)
        }
      }
    })

    return rootComments
  },

  clearComments: () => set({ comments: new Map() })
}))
