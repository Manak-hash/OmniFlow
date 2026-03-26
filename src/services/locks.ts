import { create } from 'zustand'

export interface NodeLock {
  nodeId: string
  userId: string
  userName: string
  lockedAt: string
  expiresAt: string
}

interface LockState {
  locks: Map<string, NodeLock>
  acquireLock: (nodeId: string, userId: string, userName: string) => boolean
  releaseLock: (nodeId: string, userId: string) => boolean
  getLock: (nodeId: string) => NodeLock | null
  isLocked: (nodeId: string) => boolean
  isLockedBy: (nodeId: string, userId: string) => boolean
  clearExpiredLocks: () => void
  clearAllLocks: () => void
}

const LOCK_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

export const useLockStore = create<LockState>((set, get) => ({
  locks: new Map(),

  acquireLock: (nodeId: string, userId: string, userName: string) => {
    const state = get()
    const existing = state.locks.get(nodeId)

    // Check if already locked by someone else
    if (existing && existing.userId !== userId) {
      const now = new Date()
      const expiresAt = new Date(existing.expiresAt)

      // Lock exists and hasn't expired
      if (now < expiresAt) {
        return false
      }

      // Lock expired, remove it
      state.locks.delete(nodeId)
    }

    // Acquire lock
    const now = new Date()
    const lock: NodeLock = {
      nodeId,
      userId,
      userName,
      lockedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + LOCK_TIMEOUT_MS).toISOString()
    }

    set((state) => {
      const newLocks = new Map(state.locks)
      newLocks.set(nodeId, lock)
      return { locks: newLocks }
    })

    return true
  },

  releaseLock: (nodeId: string, userId: string) => {
    const state = get()
    const lock = state.locks.get(nodeId)

    // Can only release if you own the lock
    if (!lock || lock.userId !== userId) {
      return false
    }

    set((state) => {
      const newLocks = new Map(state.locks)
      newLocks.delete(nodeId)
      return { locks: newLocks }
    })

    return true
  },

  getLock: (nodeId: string) => {
    const state = get()
    const lock = state.locks.get(nodeId)

    if (!lock) {
      return null
    }

    // Check if expired
    const now = new Date()
    const expiresAt = new Date(lock.expiresAt)
    if (now >= expiresAt) {
      // Auto-release expired lock
      set((state) => {
        const newLocks = new Map(state.locks)
        newLocks.delete(nodeId)
        return { locks: newLocks }
      })
      return null
    }

    return lock
  },

  isLocked: (nodeId: string) => {
    return get().getLock(nodeId) !== null
  },

  isLockedBy: (nodeId: string, userId: string) => {
    const lock = get().getLock(nodeId)
    return lock?.userId === userId
  },

  clearExpiredLocks: () => {
    const state = get()
    const now = new Date()
    const newLocks = new Map()

    state.locks.forEach((lock, nodeId) => {
      const expiresAt = new Date(lock.expiresAt)
      if (now < expiresAt) {
        newLocks.set(nodeId, lock)
      }
    })

    set({ locks: newLocks })
  },

  clearAllLocks: () => set({ locks: new Map() })
}))
