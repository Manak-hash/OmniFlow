import { memo } from 'react'
import { FolderOpen, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
  taskCount: number
  inProgressCount: number
  dueTodayCount: number
  onClick: () => void
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
      onClick={onClick}
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Project icon/color indicator */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              backgroundColor: project.color ? `${project.color}20` : 'rgba(239, 68, 68, 0.1)',
              color: project.color || 'rgb(239, 68, 68)'
            }}
          >
            <FolderOpen className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-omni-text group-hover:text-omni-primary transition-colors truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-omni-text-secondary line-clamp-1 mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <ArrowRight className="w-5 h-5 text-omni-text-tertiary group-hover:text-omni-primary group-hover:translate-x-1 transition-all" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        {/* Total tasks */}
        <div className="flex items-center gap-1.5 text-omni-text-secondary">
          <FolderOpen className="w-4 h-4" />
          <span>{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</span>
        </div>

        {/* In progress */}
        {inProgressCount > 0 && (
          <div className="flex items-center gap-1.5 text-blue-400">
            <Clock className="w-4 h-4" />
            <span>{inProgressCount} in progress</span>
          </div>
        )}

        {/* Due today */}
        {dueTodayCount > 0 && (
          <div className="flex items-center gap-1.5 text-amber-400">
            <CheckCircle className="w-4 h-4" />
            <span>{dueTodayCount} due today</span>
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
