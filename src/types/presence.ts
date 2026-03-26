export interface UserPresence {
  userId: string
  userName: string
  userAvatar?: string
  userColor: string
  cursor: {
    nodeId: string | null
    x: number
    y: number
    timestamp: Date
  }
  lastSeen: Date
  isEditing: boolean
}

export interface PresenceUpdate {
  type: 'cursor-move' | 'node-select' | 'node-edit' | 'join' | 'leave'
  userId: string
  data: UserPresence
}
