export type TeamRole = 'owner' | 'admin' | 'member' | 'guest'

export interface Team {
  id: string
  name: string
  ownerId: string
  memberIds: string[]
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  userId: string
  userName: string
  userAvatar?: string
  role: TeamRole
  joinedAt: string
  invitedBy?: string
}

export interface TeamInvitation {
  id: string
  teamId: string
  email: string
  role: TeamRole
  invitedBy: string
  invitedByUserName: string
  createdAt: string
  expiresAt: string
  accepted: boolean
}
