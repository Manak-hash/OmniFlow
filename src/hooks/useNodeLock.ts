import { useCallback, useEffect, useRef } from 'react'
import { useLockStore } from '@/services/locks'

interface UseNodeLockOptions {
  nodeId: string | null
  userId: string
  userName: string
  enabled?: boolean
  onLockAcquired?: () => void
  onLockFailed?: (lockedBy: string) => void
  onLockReleased?: () => void
}

export function useNodeLock({
  nodeId,
  userId,
  userName,
  enabled = true,
  onLockAcquired,
  onLockFailed,
  onLockReleased
}: UseNodeLockOptions) {
  const { acquireLock, releaseLock, isLockedBy, getLock } = useLockStore()
  const lockHeld = useRef(false)

  const acquire = useCallback(() => {
    if (!enabled || !nodeId) return false

    const acquired = acquireLock(nodeId, userId, userName)

    if (acquired) {
      lockHeld.current = true
      onLockAcquired?.()
    } else {
      const existingLock = getLock(nodeId)
      onLockFailed?.(existingLock?.userName || 'someone')
    }

    return acquired
  }, [enabled, nodeId, userId, userName, acquireLock, getLock, onLockAcquired, onLockFailed])

  const release = useCallback(() => {
    if (!enabled || !nodeId || !lockHeld.current) return

    const released = releaseLock(nodeId, userId)

    if (released) {
      lockHeld.current = false
      onLockReleased?.()
    }
  }, [enabled, nodeId, userId, releaseLock, onLockReleased])

  const isLockedByMe = useCallback(() => {
    if (!nodeId) return false
    return isLockedBy(nodeId, userId)
  }, [nodeId, userId, isLockedBy])

  // Auto-release lock on unmount or when nodeId changes
  useEffect(() => {
    return () => {
      release()
    }
  }, [nodeId, release])

  // Auto-refresh lock every 2 minutes to prevent timeout
  useEffect(() => {
    if (!lockHeld.current || !nodeId) return

    const interval = setInterval(() => {
      if (lockHeld.current) {
        // Re-acquire lock to refresh timeout
        acquireLock(nodeId, userId, userName)
      }
    }, 2 * 60 * 1000) // 2 minutes

    return () => clearInterval(interval)
  }, [lockHeld.current, nodeId, userId, userName, acquireLock])

  return {
    acquire,
    release,
    isLockedByMe,
    hasLock: lockHeld.current
  }
}
