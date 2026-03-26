import { useState } from 'react'
import { Activity, Filter } from 'lucide-react'
import { ActivityFeed } from './ActivityFeed'
import { cn } from '@/utils/cn'

type ActivityFilter = 'all' | 'created' | 'updated' | 'commented'

export function ActivityPanel({ className }: { className?: string }) {
  const [filter, setFilter] = useState<ActivityFilter>('all')

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text">Activity Feed</h3>
        </div>

        {/* Filter button */}
        <button
          onClick={() => {
            const filters: ActivityFilter[] = ['all', 'created', 'updated', 'commented']
            const currentIndex = filters.indexOf(filter)
            const nextIndex = (currentIndex + 1) % filters.length
            setFilter(filters[nextIndex])
          }}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="Filter activities"
        >
          <Filter className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Filter badge */}
      {filter !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Showing:</span>
          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-medium">
            {filter}
          </span>
        </div>
      )}

      {/* Activity Feed */}
      <ActivityFeed
        limit={20}
        filterBy={filter === 'all' ? undefined : 'type'}
        filterValue={filter === 'all' ? undefined : filter}
      />
    </div>
  )
}
