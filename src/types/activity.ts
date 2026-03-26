export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'commented'
  | 'state-changed'
  | 'mentioned'

export interface Activity {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  action: ActivityAction
  targetType: 'node' | 'comment' | 'mindmap'
  targetId: string
  targetTitle?: string
  timestamp: string
  metadata?: {
    field?: string
    oldValue?: any
    newValue?: any
    reason?: string
  }
}
