import { useEffect, useState } from 'react'
import { getSyncService, type SyncState } from '@/services/sync'

export function useSync() {
  const syncService = getSyncService()
  const [syncState, setSyncState] = useState<SyncState>(syncService.getState())

  useEffect(() => {
    const unsubscribe = syncService.subscribe(setSyncState)
    return unsubscribe
  }, [syncService])

  const sync = async () => {
    await syncService.forceSyncNow()
  }

  return {
    ...syncState,
    sync,
    isSyncing: syncState.status === 'syncing',
    hasError: syncState.status === 'error',
    canSync: syncState.isConnected && syncState.status !== 'syncing'
  }
}
