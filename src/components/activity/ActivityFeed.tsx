import { useMemo } from 'react'
import { Clock, FileEdit, Trash2, MessageCircle, Hash, AtSign } from 'lucide-react'
import { useActivityStore } from '@/services/activity'
import type { Activity } from '@/types/activity'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'

interface ActivityFeedProps {
  limit?: number
  filterBy?: 'user' | 'type'
  filterValue?: string
  className?: string
}

export function ActivityFeed({
  limit = 20,
  filterBy,
  filterValue,
  className
}: ActivityFeedProps) {
  const { getActivities, getActivitiesByUser, getActivitiesByType } = useActivityStore()

  const activities = useMemo(() => {
    if (filterBy === 'user' && filterValue) {
      return getActivitiesByUser(filterValue, limit)
    } else if (filterBy === 'type' && filterValue) {
      return getActivitiesByType(filterValue as any, limit)
    }
    return getActivities(limit)
  }, [limit, filterBy, filterValue, getActivities, getActivitiesByUser, getActivitiesByType])

  if (activities.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-400', className)}>
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No recent activity</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  )
}

interface ActivityItemProps {
  activity: Activity
}

function ActivityItem({ activity }: ActivityItemProps) {
  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })

  return (
    <div className="flex items-start gap-3 bg-gray-800 rounded-lg p-3 border border-gray-700">
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        getActivityColor(activity.action)
      )}>
        {getActivityIcon(activity.action)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* User and action */}
        <div className="flex items-center gap-2 mb-1">
          {activity.userAvatar ? (
            <img
              src={activity.userAvatar}
              alt={activity.userName}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
              {activity.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-sm text-text">{activity.userName}</span>
          <span className="text-sm text-gray-400">{getActivityText(activity)}</span>
        </div>

        {/* Target info */}
        {activity.targetTitle && (
          <div className="text-xs text-gray-400 truncate">
            {activity.targetTitle}
          </div>
        )}

        {/* Metadata */}
        {activity.metadata?.reason && (
          <div className="text-xs text-gray-500 italic mt-1">
            "{activity.metadata.reason}"
          </div>
        )}
      </div>

      {/* Time */}
      <div className="flex-shrink-0 text-xs text-gray-500">
        {timeAgo}
      </div>
    </div>
  )
}

function getActivityIcon(action: Activity['action']) {
  const iconClass = 'w-4 h-4'

  switch (action) {
    case 'created':
      return <Hash className={iconClass} />
    case 'updated':
      return <FileEdit className={iconClass} />
    case 'deleted':
      return <Trash2 className={iconClass} />
    case 'commented':
      return <MessageCircle className={iconClass} />
    case 'state-changed':
      return <Hash className={iconClass} />
    case 'mentioned':
      return <AtSign className={iconClass} />
    default:
      return <Clock className={iconClass} />
  }
}

function getActivityColor(action: Activity['action']): string {
  switch (action) {
    case 'created':
      return 'bg-green-900/50 text-green-400'
    case 'updated':
      return 'bg-blue-900/50 text-blue-400'
    case 'deleted':
      return 'bg-red-900/50 text-red-400'
    case 'commented':
      return 'bg-purple-900/50 text-purple-400'
    case 'state-changed':
      return 'bg-yellow-900/50 text-yellow-400'
    case 'mentioned':
      return 'bg-pink-900/50 text-pink-400'
    default:
      return 'bg-gray-700 text-gray-400'
  }
}

function getActivityText(activity: Activity): string {
  switch (activity.action) {
    case 'created':
      return `created this ${activity.targetType}`
    case 'updated':
      return activity.metadata?.field
        ? `changed ${activity.metadata.field}`
        : `updated this ${activity.targetType}`
    case 'deleted':
      return `deleted this ${activity.targetType}`
    case 'commented':
      return 'commented'
    case 'state-changed':
      return `changed state to ${activity.metadata?.newValue || 'new state'}`
    case 'mentioned':
      return `mentioned you`
    default:
      return 'performed an action'
  }
}
