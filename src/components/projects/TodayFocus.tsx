import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Clock, TrendingUp, AlertCircle, Coffee } from 'lucide-react'
import { cn } from '@/utils/cn'

interface TodayFocusProps {
  className?: string
}

export function TodayFocus({ className }: TodayFocusProps) {
  // Placeholder data - will be populated when task store has getAllTasks
  const focusData = useMemo(() => ({
    tasksDueToday: [] as Array<{ title: string, projectId: string, projectName: string }>,
    inProgressTasks: [] as Array<{ title: string, projectId: string, projectName: string }>,
    recentActivity: [] as Array<{ title: string, projectId: string, projectName: string, time: string }>
  }), [])

  const hasContent =
    focusData.tasksDueToday.length > 0 ||
    focusData.inProgressTasks.length > 0 ||
    focusData.recentActivity.length > 0

  if (!hasContent) {
    return (
      <div className={cn('glass rounded-xl border border-omni-border p-6', className)}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-omni-text-secondary" />
          <h2 className="text-lg font-semibold text-omni-text">Today's Focus</h2>
        </div>

        <div className="text-center py-8">
          <Coffee className="w-12 h-12 mx-auto mb-3 text-omni-text/30" />
          <p className="text-omni-text-secondary text-sm">
            No tasks due today or in progress. Great time to plan ahead!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('glass rounded-xl border border-omni-border p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-omni-text-secondary" />
        <h2 className="text-lg font-semibold text-omni-text">Today's Focus</h2>
      </div>

      <div className="space-y-6">
        {/* Tasks due today */}
        {focusData.tasksDueToday.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-medium text-omni-text">
                Due Today ({focusData.tasksDueToday.length})
              </h3>
            </div>
            <div className="space-y-2">
              {focusData.tasksDueToday.map((task) => (
                <Link
                  key={task.projectId}
                  to={`/project/${task.projectId}`}
                  className="block p-3 bg-omni-bg-secondary rounded-lg border border-omni-border hover:border-omni-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-medium text-omni-text">{task.title}</h4>
                  </div>
                  <p className="text-xs text-omni-text-secondary">{task.projectName}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* In progress tasks */}
        {focusData.inProgressTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-medium text-omni-text">
                In Progress ({focusData.inProgressTasks.length})
              </h3>
            </div>
            <div className="space-y-2">
              {focusData.inProgressTasks.slice(0, 5).map((task) => (
                <Link
                  key={task.projectId}
                  to={`/project/${task.projectId}`}
                  className="block p-3 bg-omni-bg-secondary rounded-lg border border-omni-border hover:border-omni-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-medium text-omni-text">{task.title}</h4>
                  </div>
                  <p className="text-xs text-omni-text-secondary">{task.projectName}</p>
                </Link>
              ))}
              {focusData.inProgressTasks.length > 5 && (
                <p className="text-xs text-omni-text-tertiary text-center pt-1">
                  +{focusData.inProgressTasks.length - 5} more in progress
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recent activity */}
        {focusData.recentActivity.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-omni-text-secondary" />
              <h3 className="text-sm font-medium text-omni-text">
                Recent Activity ({focusData.recentActivity.length})
              </h3>
            </div>
            <div className="space-y-2">
              {focusData.recentActivity.slice(0, 5).map((task) => (
                <Link
                  key={task.projectId}
                  to={`/project/${task.projectId}`}
                  className="block p-3 bg-omni-bg-secondary rounded-lg border border-omni-border hover:border-omni-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-omni-text truncate">{task.title}</h4>
                      <p className="text-xs text-omni-text-secondary">{task.projectName}</p>
                    </div>
                    <span className="text-xs text-omni-text-tertiary whitespace-nowrap">{task.time}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
