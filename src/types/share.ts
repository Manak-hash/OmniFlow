export type SharePermission = 'view' | 'comment' | 'edit'

export interface ShareLink {
  id: string
  mindmapId: string
  token: string // Unique token for URL
  permissions: SharePermission
  password?: string // Optional password protection
  createdAt: string
  expiresAt: string | null
  accessCount: number
  createdBy: string
  createdByUserName: string
  isActive: boolean
}

export interface ShareLinkStats {
  totalLinks: number
  activeLinks: number
  totalAccesses: number
  mostAccessed: ShareLink | null
}
