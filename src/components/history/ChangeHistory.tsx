import { useMemo } from 'react'
import { Clock, ArrowRight } from 'lucide-react'
import { useChangeHistoryStore } from '@/services/changeHistory'
import type { ChangeHistory } from '@/types/history'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'

interface ChangeHistoryProps {
  nodeId: string
  className?: string
}

export function ChangeHistory({ nodeId, className }: ChangeHistoryProps) {
  const { getChangesForNode } = useChangeHistoryStore()
  const changes = useMemo(() => getChangesForNode(nodeId), [nodeId, getChangesForNode])

  if (changes.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-400', className)}>
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No changes yet</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {changes.map((change) => (
        <ChangeHistoryItem key={change.id} change={change} />
      ))}
    </div>
  )
}

interface ChangeHistoryItemProps {
  change: ChangeHistory
}

function ChangeHistoryItem({ change }: ChangeHistoryItemProps) {
  const timeAgo = formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* User avatar or initial */}
          {change.userAvatar ? (
            <img
              src={change.userAvatar}
              alt={change.userName}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
              {change.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-sm text-text">{change.userName}</span>
        </div>
        <span className="text-xs text-gray-400">{timeAgo}</span>
      </div>

      {/* Change description */}
      <div className="text-sm">
        {change.changeType === 'created' && (
          <span className="text-green-400">Created this node</span>
        )}
        {change.changeType === 'deleted' && (
          <span className="text-red-400">Deleted this node</span>
        )}
        {change.changeType === 'title' && (
          <span className="text-blue-400">Changed title</span>
        )}
        {change.changeType === 'content' && (
          <span className="text-blue-400">Updated content</span>
        )}
        {change.changeType === 'state' && (
          <span className="text-purple-400">
            Changed state from <span className="font-medium">{change.changes[0]?.oldValue || 'None'}</span> to{' '}
            <span className="font-medium">{change.changes[0]?.newValue}</span>
          </span>
        )}
        {change.changeType === 'progress' && (
          <span className="text-yellow-400">Updated progress</span>
        )}
        {change.changeType === 'tags' && (
          <span className="text-pink-400">Modified tags</span>
        )}
        {change.changeType === 'references' && (
          <span className="text-cyan-400">Updated references</span>
        )}
        {change.changeType === 'bulk' && (
          <span className="text-gray-400">Made multiple changes</span>
        )}
      </div>

      {/* Detailed changes for bulk edits */}
      {change.changeType === 'bulk' && change.changes.length > 0 && (
        <div className="mt-2 space-y-1">
          {change.changes.map((fieldChange, index) => (
            <div key={index} className="text-xs text-gray-400 flex items-center gap-2">
              <span className="font-medium">{fieldChange.field}:</span>
              <ChangeDiff oldValue={fieldChange.oldValue} newValue={fieldChange.newValue} />
            </div>
          ))}
        </div>
      )}

      {/* Reason for state changes */}
      {change.reason && (
        <div className="mt-2 text-xs text-gray-400 italic">
          "{change.reason}"
        </div>
      )}
    </div>
  )
}

interface ChangeDiffProps {
  oldValue: any
  newValue: any
}

function ChangeDiff({ oldValue, newValue }: ChangeDiffProps) {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'None'
    if (typeof value === 'object') return JSON.stringify(value)
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    return String(value)
  }

  const oldStr = formatValue(oldValue)
  const newStr = formatValue(newValue)

  // For simple values, show old → new
  if (oldStr.length < 30 && newStr.length < 30) {
    return (
      <span className="flex items-center gap-1">
        <span className="line-through text-red-400">{oldStr}</span>
        <ArrowRight className="w-3 h-3 text-gray-500" />
        <span className="text-green-400">{newStr}</span>
      </span>
    )
  }

  // For long values, just show that it changed
  return <span className="text-gray-400">(modified)</span>
}
