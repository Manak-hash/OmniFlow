import { useCallback } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { ChevronRight, ChevronDown, Plus } from 'lucide-react'
import { ProgressBar } from '@/components/mindmap/ProgressBar'
import { TagBadge } from '@/components/mindmap/TagBadge'
import { ReferenceIndicator } from '@/components/mindmap/ReferenceIndicator'
import { STATE_CONFIGS } from '@/constants/states'
import type { Task } from '@/types/task'
import { cn } from '@/utils/cn'


interface TaskItemContentProps {
  task: Task
  isSelected: boolean
  isCollapsed: boolean
  hasChildren: boolean
  onSelect: (task: Task) => void
  onToggleCollapse: (taskId: string) => void
  onEdit: (task: Task) => void
  onCreateSubtask?: (parentTaskId: string) => void
  isOver?: boolean
  isDragTarget?: boolean
  showMakeSubtask?: boolean
}

export function TaskItemContent({
  task,
  isSelected,
  isCollapsed,
  hasChildren,
  onSelect,
  onToggleCollapse,
  onEdit,
  onCreateSubtask,
  isOver = false,
  isDragTarget = false,
  showMakeSubtask = false
}: TaskItemContentProps) {
  const stateConfig = STATE_CONFIGS[task.state]
  const StateIcon = stateConfig.icon

  const {
    attributes,
    listeners,
    setNodeRef
  } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  const handleDoubleClick = useCallback(() => {
    onEdit(task)
  }, [task, onEdit])

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only trigger selection if not clicking on interactive elements
    const target = e.target as HTMLElement
    const isButtonClick = target.closest('button')

    if (!isButtonClick) {
      onSelect(task)
    }
  }, [task, onSelect])

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{ touchAction: 'none' }} // Ensure touch actions don't interfere with drag
      className={cn(
        'group flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200',
        'cursor-grab active:cursor-grabbing',
        'hover:bg-omni-text/5',
        'relative z-10', // Ensure content is above the subtask highlight
        isSelected && 'bg-omni-primary/10 ring-1 ring-omni-primary/30',
        isDragTarget && 'opacity-50 scale-95',
        isOver && 'ring-2 ring-omni-primary bg-omni-primary/5',
        showMakeSubtask && 'ring-2 ring-blue-500 bg-blue-500/5 scale-[1.02]'
      )}
    >
      {/* Collapse/Expand Button */}
      {hasChildren ? (
        <button
          onClick={() => onToggleCollapse(task.id)}
          className={cn(
            'flex-shrink-0 p-0.5 rounded transition-colors',
            'hover:bg-omni-text/10',
            'text-omni-text/40 hover:text-omni-text'
          )}
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      ) : (
        <div className="w-6 flex-shrink-0" />
      )}

      {/* State Icon */}
      <div
        className={cn(
          'flex-shrink-0 p-1.5 rounded-lg',
          `bg-${stateConfig.color}-900/20`,
          `text-${stateConfig.color}-400`
        )}
        title={stateConfig.description}
      >
        <StateIcon className={cn('w-4 h-4', task.state === 'in-progress' && 'animate-spin')} />
      </div>

      {/* Task Title */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="font-medium text-omni-text truncate">{task.title}</span>
        {task.progress > 0 && (
          <span className="text-xs text-omni-text/50 flex-shrink-0">
            {Math.round(task.progress)}%
          </span>
        )}
        {/* Add subtask button */}
        {onCreateSubtask && (
          <button
            onClick={() => onCreateSubtask(task.id)}
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'flex-shrink-0 p-1 rounded hover:bg-omni-text/10',
              'text-omni-text/40 hover:text-omni-primary'
            )}
            title="Add subtask"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        {/* Subtask hint */}
        {showMakeSubtask && (
          <div className="flex-shrink-0 text-xs text-blue-400 font-medium">
            Drop to make subtask
          </div>
        )}
      </div>

      {/* Progress */}
      {task.progressTarget && (
        <div className="w-24">
          <ProgressBar
            current={task.progressCurrent ?? 0}
            target={task.progressTarget}
            size="sm"
            showPercentage={false}
          />
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex gap-1">
          {task.tags.slice(0, 2).map(tag => (
            <TagBadge key={tag} tag={tag} size="sm" />
          ))}
          {task.tags.length > 2 && (
            <span className="text-xs text-omni-text-tertiary">+{task.tags.length - 2}</span>
          )}
        </div>
      )}

      {/* References */}
      {task.references && task.references.length > 0 && (
        <ReferenceIndicator count={task.references.length} size="sm" />
      )}
    </div>
  )
}