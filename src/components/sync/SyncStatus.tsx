import { RefreshCw, Cloud, CloudOff, AlertCircle, Check } from 'lucide-react'
import { useSync } from '@/hooks/useSync'
import { cn } from '@/utils/cn'

interface SyncStatusProps {
  className?: string
  showLabel?: boolean
}

export function SyncStatus({ className, showLabel = false }: SyncStatusProps) {
  const { status, lastSync, lastError, pendingChanges, sync, canSync, isConnected } = useSync()

  const handleSync = () => {
    if (canSync) {
      sync()
    }
  }

  // Don't show anything if not connected
  if (!isConnected) {
    return (
      <div className={cn('flex items-center gap-2 text-omni-text-tertiary', className)}>
        <CloudOff className="w-4 h-4" />
        {showLabel && <span className="text-xs">Offline</span>}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Status icon and label */}
      <button
        onClick={handleSync}
        disabled={!canSync}
        className={cn(
          'flex items-center gap-2 px-2 py-1 rounded-lg transition-colors',
          'hover:bg-omni-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed',
          status === 'syncing' && 'animate-pulse'
        )}
        title={lastError || `Last sync: ${lastSync ? lastSync.toLocaleTimeString() : 'Never'}`}
      >
        {status === 'syncing' && (
          <RefreshCw className="w-4 h-4 text-omni-accent animate-spin" />
        )}
        {status === 'success' && (
          <>
            <Check className="w-4 h-4 text-green-500" />
            {showLabel && <span className="text-xs text-omni-text-secondary">Synced</span>}
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            {showLabel && <span className="text-xs text-red-400">Sync error</span>}
          </>
        )}
        {status === 'idle' && (
          <>
            <Cloud className="w-4 h-4 text-omni-text-secondary" />
            {showLabel && <span className="text-xs text-omni-text-secondary">Synced</span>}
          </>
        )}
      </button>

      {/* Pending changes indicator */}
      {pendingChanges > 0 && (
        <span className="flex items-center gap-1 px-2 py-1 bg-omni-accent/20 text-omni-accent rounded-full text-xs">
          {pendingChanges} pending
        </span>
      )}
    </div>
  )
}
