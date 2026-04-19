import { memo } from 'react'
import { FolderOpen, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
  taskCount: number
  inProgressCount: number
  dueTodayCount: number
  onClick: (slug: string) => void
  className?: string
}

export const ProjectCard = memo(({
  project,
  taskCount,
  inProgressCount,
  dueTodayCount,
  onClick,
  className
}: ProjectCardProps) => {
  return (
    <button
      onClick={() => onClick(project.slug)}
      className={cn(
        'group text-left w-full',
        'glass p-6 rounded-xl border border-omni-border',
        'hover:border-omni-primary/50 hover:shadow-lg hover:shadow-omni-primary/10',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-omni-primary focus:ring-offset-2 focus:ring-offset-omni-bg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Project icon/color indicator */}
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0"
            style={{
              backgroundColor: project.color ? `${project.color}20` : 'rgba(239, 68, 68, 0.1)',
              color: project.color || 'rgb(239, 68, 68)'
            }}
          >
            <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-omni-text group-hover:text-omni-primary transition-colors truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs sm:text-sm text-omni-text-secondary line-clamp-1 mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-omni-text-tertiary group-hover:text-omni-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>

      {/* Stats - Responsive flex */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
        {/* Total tasks */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-omni-text-secondary">
          <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</span>
        </div>

        {/* In progress */}
        {inProgressCount > 0 && (
          <div className="flex items-center gap-1 sm:gap-1.5 text-blue-400">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{inProgressCount} in progress</span>
            <span className="sm:hidden">{inProgressCount}</span>
          </div>
        )}

        {/* Due today */}
        {dueTodayCount > 0 && (
          <div className="flex items-center gap-1 sm:gap-1.5 text-amber-400">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{dueTodayCount} due today</span>
            <span className="sm:hidden">{dueTodayCount}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {taskCount > 0 && (
        <div className="mt-4">
          <div className="h-1.5 bg-omni-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-omni-primary rounded-full transition-all duration-300"
              style={{
                width: `${taskCount > 0 ? ((taskCount - inProgressCount) / taskCount) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Last updated */}
      <div className="mt-3 text-xs text-omni-text-tertiary">
        Updated {new Date(project.updatedAt).toLocaleDateString()}
      </div>
    </button>
  )
})

ProjectCard.displayName = 'ProjectCard'
