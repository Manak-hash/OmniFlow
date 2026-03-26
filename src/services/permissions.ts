import { create } from 'zustand'
import type { Permission, ResourceAccess, AccessRequest } from '@/types/permissions'

interface PermissionState {
  resourceAccess: Map<string, ResourceAccess[]>
  accessRequests: Map<string, AccessRequest[]>

  // Actions
  setResourceAccess: (access: ResourceAccess[]) => void
  addResourceAccess: (access: ResourceAccess) => void
  removeResourceAccess: (accessId: string) => void
  getResourceAccess: (resourceId: string) => ResourceAccess[]
  getUserPermission: (resourceId: string, userId: string) => Permission | null

  setAccessRequests: (requests: AccessRequest[]) => void
  addAccessRequest: (request: AccessRequest) => void
  updateAccessRequest: (id: string, updates: Partial<AccessRequest>) => void

  checkPermission: (resourceId: string, userId: string, requiredPermission: Permission) => boolean
  hasAccess: (resourceId: string, userId: string, requiredPermission: Permission) => boolean
  clearAll: () => void
}

// Permission hierarchy (higher = more permissions)
const PERMISSION_LEVELS: Record<Permission, number> = {
  view: 1,
  comment: 2,
  edit: 3,
  admin: 4,
  owner: 5
}

export function getPermissionLevel(permission: Permission): number {
  return PERMISSION_LEVELS[permission]
}

export function hasPermissionOrHigher(userPermission: Permission, required: Permission): boolean {
  return getPermissionLevel(userPermission) >= getPermissionLevel(required)
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  resourceAccess: new Map(),
  accessRequests: new Map(),

  setResourceAccess: (access) => {
    const accessMap = new Map<string, ResourceAccess[]>()
    access.forEach(a => {
      if (!accessMap.has(a.resourceId)) {
        accessMap.set(a.resourceId, [])
      }
      accessMap.get(a.resourceId)!.push(a)
    })
    set({ resourceAccess: accessMap })
  },

  addResourceAccess: (access) => {
    set((state) => {
      const newAccess = new Map(state.resourceAccess)
      if (!newAccess.has(access.resourceId)) {
        newAccess.set(access.resourceId, [])
      }
      newAccess.get(access.resourceId)!.push(access)
      return { resourceAccess: newAccess }
    })
  },

  removeResourceAccess: (accessId) => {
    set((state) => {
      const newAccess = new Map()
      state.resourceAccess.forEach((accessList, resourceId) => {
        const filtered = accessList.filter(a => a.id !== accessId)
        if (filtered.length > 0) {
          newAccess.set(resourceId, filtered)
        }
      })
      return { resourceAccess: newAccess }
    })
  },

  getResourceAccess: (resourceId) => {
    return get().resourceAccess.get(resourceId) || []
  },

  getUserPermission: (resourceId, userId) => {
    const accessList = get().getResourceAccess(resourceId)

    // Check direct user access
    const userAccess = accessList.find(a => a.userId === userId)
    if (userAccess) {
      return userAccess.permission
    }

    // Check team access
    // This would require checking user's teams, which is a placeholder for now
    return null
  },

  setAccessRequests: (requests) => {
    const requestMap = new Map()
    requests.forEach(r => {
      if (!requestMap.has(r.resourceId)) {
        requestMap.set(r.resourceId, [])
      }
      requestMap.get(r.resourceId)!.push(r)
    })
    set({ accessRequests: requestMap })
  },

  addAccessRequest: (request) => {
    set((state) => {
      const newRequests = new Map(state.accessRequests)
      if (!newRequests.has(request.resourceId)) {
        newRequests.set(request.resourceId, [])
      }
      newRequests.get(request.resourceId)!.push(request)
      return { accessRequests: newRequests }
    })
  },

  updateAccessRequest: (id, updates) => {
    set((state) => {
      const newRequests = new Map()
      state.accessRequests.forEach((requests, resourceId) => {
        newRequests.set(
          resourceId,
          requests.map(r => r.id === id ? { ...r, ...updates } : r)
        )
      })
      return { accessRequests: newRequests }
    })
  },

  checkPermission: (resourceId, userId, requiredPermission) => {
    const userPermission = get().getUserPermission(resourceId, userId)

    // Owner always has all permissions
    if (userPermission === 'owner') return true

    // Check if user has required permission level
    return userPermission ? hasPermissionOrHigher(userPermission, requiredPermission) : false
  },

  hasAccess: (resourceId, userId, requiredPermission) => {
    return get().checkPermission(resourceId, userId, requiredPermission)
  },

  clearAll: () => set({
    resourceAccess: new Map(),
    accessRequests: new Map()
  })
}))
