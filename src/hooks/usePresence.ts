import { useEffect, useRef, useCallback } from 'react'
import { usePresenceStore } from '@/services/presence'
import type { UserPresence } from '@/types/presence'

interface UsePresenceOptions {
  userId: string
  userName: string
  userAvatar?: string
  mindmapId: string
  enabled?: boolean
}

const USER_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#f43f5e', // pink
]

function getUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}

export function usePresence(options: UsePresenceOptions) {
  const { userId, userName, userAvatar, enabled = true } = options
  const { setCurrentUser } = usePresenceStore()
  const heartbeatInterval = useRef<number | null>(null)
  const heartbeatTimeout = useRef<number | null>(null)

  const initializePresence = useCallback(() => {
    if (!enabled) return

    const user: UserPresence = {
      userId,
      userName,
      userAvatar,
      userColor: getUserColor(userId),
      cursor: {
        nodeId: null,
        x: 0,
        y: 0,
        timestamp: new Date()
      },
      lastSeen: new Date(),
      isEditing: false
    }

    setCurrentUser(user)

    // Start heartbeat to keep presence alive
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current)
    }

    heartbeatInterval.current = setInterval(() => {
      // TODO: Send heartbeat to server
    }, 30000) // Every 30 seconds
  }, [enabled, userId, userName, userAvatar, setCurrentUser])

  const cleanupPresence = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current)
    }

    if (heartbeatTimeout.current) {
      clearTimeout(heartbeatTimeout.current)
    }

    // TODO: Send leave event to server
  }, [userName])

  const updateCursor = useCallback((nodeId: string | null, x: number = 0, y: number = 0) => {
    if (!enabled) return

    const store = usePresenceStore.getState()
    const currentUser = store.currentUser

    if (currentUser) {
      store.updateUserPresence(userId, {
        ...currentUser,
        cursor: {
          nodeId,
          x,
          y,
          timestamp: new Date()
        },
        lastSeen: new Date(),
        isEditing: false
      })

      // Debounce sending to server
      if (heartbeatTimeout.current) {
        clearTimeout(heartbeatTimeout.current)
      }

      heartbeatTimeout.current = setTimeout(() => {
        // TODO: Send cursor update to server
      }, 500)
    }
  }, [enabled, userId])

  const setEditing = useCallback((isEditing: boolean) => {
    if (!enabled) return

    const store = usePresenceStore.getState()
    const currentUser = store.currentUser

    if (currentUser) {
      store.updateUserPresence(userId, {
        ...currentUser,
        lastSeen: new Date(),
        isEditing
      })
    }
  }, [enabled, userId])

  // Initialize on mount
  useEffect(() => {
    initializePresence()
    return cleanupPresence
    // Only run on mount - don't re-run when dependencies change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPresence()
    }
    // Only run on mount - don't re-run when dependencies change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    updateCursor,
    setEditing
  }
}
