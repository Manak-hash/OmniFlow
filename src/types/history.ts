import type { Node } from '@/types/node'

export type ChangeType =
  | 'created'
  | 'deleted'
  | 'title'
  | 'content'
  | 'state'
  | 'progress'
  | 'tags'
  | 'references'
  | 'position'

export interface FieldChange {
  field: keyof Node | string
  oldValue: any
  newValue: any
}

export interface ChangeHistory {
  id: string
  nodeId: string
  userId: string
  userName: string
  userAvatar?: string
  timestamp: string
  changeType: ChangeType | 'bulk' // bulk for multiple changes at once
  changes: FieldChange[]
  reason?: string // For state changes, etc.
}

export interface ChangeHistoryFilter {
  nodeId?: string
  userId?: string
  changeType?: ChangeType | 'bulk'
  startDate?: Date
  endDate?: Date
}
