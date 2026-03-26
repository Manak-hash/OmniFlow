import { getReplicache } from '@/store/replicache'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'
export type SyncErrorType = 'network' | 'auth' | 'conflict' | 'server'

export interface SyncState {
  status: SyncStatus
  lastSync: Date | null
  lastError: string | null
  errorType: SyncErrorType | null
  pendingChanges: number
  isConnected: boolean
}

class SyncService {
  private listeners: Set<(state: SyncState) => void> = new Set()
  private state: SyncState = {
    status: 'idle',
    lastSync: null,
    lastError: null,
    errorType: null,
    pendingChanges: 0,
    isConnected: true
  }
  private syncInterval: ReturnType<typeof setInterval> | null = null
  private syncPromise: Promise<void> | null = null

  constructor() {
    // Start periodic sync (every 30 seconds)
    this.startPeriodicSync()
  }

  getState(): SyncState {
    return { ...this.state }
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private setState(updates: Partial<SyncState>) {
    this.state = { ...this.state, ...updates }
    this.listeners.forEach(listener => listener(this.getState()))
  }

  async pull(): Promise<void> {
    const replicache = getReplicache()
    // @ts-ignore - access private property
    if (!replicache.pullURL) {
      console.log('[Sync] No pullURL configured - running in local-only mode')
      this.setState({ status: 'idle', lastSync: new Date() })
      return
    }

    try {
      this.setState({ status: 'syncing' })

      // For now, simulate sync (replace with actual Replicache pull)
      // TODO: Implement actual Replicache pull with server
      await new Promise(resolve => setTimeout(resolve, 1000))

      this.setState({
        status: 'success',
        lastSync: new Date(),
        lastError: null,
        errorType: null
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorType = this.getErrorType(errorMessage)

      this.setState({
        status: 'error',
        lastError: errorMessage,
        errorType
      })

      console.error('[Sync] Pull failed:', error)
    }
  }

  async push(): Promise<void> {
    const replicache = getReplicache()
    // @ts-ignore
    if (!replicache.pushURL) {
      console.log('[Sync] No pushURL configured - running in local-only mode')
      return
    }

    try {
      // TODO: Implement actual Replicache push
      // For now, simulate push
      await new Promise(resolve => setTimeout(resolve, 500))

      this.setState({
        pendingChanges: 0
      })
    } catch (error) {
      console.error('[Sync] Push failed:', error)
      throw error
    }
  }

  async sync(): Promise<void> {
    // Prevent concurrent syncs
    if (this.syncPromise) {
      return this.syncPromise
    }

    this.syncPromise = (async () => {
      try {
        await this.pull()
        await this.push()
      } finally {
        this.syncPromise = null
      }
    })()

    return this.syncPromise
  }

  private startPeriodicSync() {
    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      if (this.state.isConnected) {
        this.sync().catch(console.error)
      }
    }, 30000)
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  setConnected(connected: boolean) {
    this.setState({ isConnected: connected })
  }

  incrementPendingChanges() {
    this.setState({ pendingChanges: this.state.pendingChanges + 1 })
  }

  private getErrorType(message: string): SyncErrorType {
    if (message.includes('network') || message.includes('fetch')) {
      return 'network'
    }
    if (message.includes('auth') || message.includes('401')) {
      return 'auth'
    }
    if (message.includes('conflict') || message.includes('409')) {
      return 'conflict'
    }
    return 'server'
  }

  async forceSyncNow(): Promise<void> {
    await this.sync()
  }
}

// Singleton instance
let syncService: SyncService | null = null

export function getSyncService(): SyncService {
  if (!syncService) {
    syncService = new SyncService()
  }
  return syncService
}
