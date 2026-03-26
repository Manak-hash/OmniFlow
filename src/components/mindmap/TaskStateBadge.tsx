import { STATE_CONFIG } from '@/utils/state'
import type { TaskState } from '@/types/node'
import { cn } from '@/utils/cn'

interface TaskStateBadgeProps {
  state: TaskState
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function TaskStateBadge({
  state,
  size = 'sm',
  showLabel = true,
  className
}: TaskStateBadgeProps) {
  const config = STATE_CONFIG[state]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        `bg-${config.color}-900/50`,
        `text-${config.color}-400`,
        sizeClasses[size],
        className
      )}
      title={config.description}
    >
      <Icon className={cn(iconSizes[size], state === 'in-progress' && 'animate-spin')} />
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}
