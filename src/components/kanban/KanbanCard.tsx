import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { Task } from '@/types/task'
import { cn } from '@/utils/cn'
import { forwardRef } from 'react'

interface KanbanCardProps {
  task: Task
  onEditTask: (task: Task) => void
}

interface KanbanCardPresentationalProps {
  task: Task
  isDragging?: boolean
}

// Presentational component (no hooks) - used in DragOverlay
export const KanbanCardPresentational = forwardRef<HTMLDivElement, KanbanCardPresentationalProps>(
  ({ task, isDragging = false }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-3 bg-omni-bg rounded-lg border border-omni-border',
          'shadow-sm',
          isDragging && 'rotate-3'
        )}
      >
        {/* Task Title */}
        <h4 className="font-medium text-omni-text mb-2">{task.title}</h4>

        {/* Task Description */}
        {task.description && (
          <p className="text-sm text-omni-text-secondary mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Task Footer */}
        <div className="flex items-center justify-between text-xs">
          {/* Progress */}
          {task.progress > 0 && (
            <span className="text-omni-text-secondary">
              {Math.round(task.progress)}%
            </span>
          )}

          {/* Subtask Count */}
          {task.hasChildren && (
            <span className="text-omni-text-secondary">
              {task.hasChildren ? '1+ subtask' : '0 subtasks'}
            </span>
          )}

          {/* Parent indicator */}
          {task.parentId && (
            <span className="text-omni-text/50">
              ↳ subtask
            </span>
          )}
        </div>
      </div>
    )
  }
)

KanbanCardPresentational.displayName = 'KanbanCardPresentational'

// Draggable component - uses hooks
export function KanbanCard({ task, onEditTask }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging
  } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableRef(node)
    setDroppableRef(node)
  }

  return (
    <div
      id={`task-${task.id}`}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => {
        onEditTask(task)
      }}
      className={cn(
        'cursor-pointer hover:border-omni-primary/50 transition-all',
        'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40 scale-95'
      )}
    >
      <KanbanCardPresentational task={task} />
    </div>
  )
}
