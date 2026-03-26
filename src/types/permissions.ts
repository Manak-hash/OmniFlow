export type Permission = 'view' | 'comment' | 'edit' | 'admin' | 'owner'

export interface ResourceAccess {
  id: string
  resourceId: string // mindmapId or nodeId
  resourceType: 'mindmap' | 'node'
  userId: string | null // null if team access
  teamId: string | null // null if user access
  permission: Permission
  grantedBy: string
  grantedAt: string
}

export interface AccessRequest {
  id: string
  resourceId: string
  resourceType: 'mindmap' | 'node'
  userId: string
  userName: string
  requestedPermission: Permission
  createdAt: string
  status: 'pending' | 'approved' | 'denied'
  reviewedAt?: string
  reviewedBy?: string
}
