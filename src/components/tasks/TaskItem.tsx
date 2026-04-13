import { useState, useCallback, memo, forwardRef } from 'react'
import { ChevronRight, ChevronDown, Plus } from 'lucide-react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { Task } from '@/types/task'
import { STATE_CONFIGS } from '@/constants/states'
import { cn } from '@/utils/cn'

interface TaskItemProps {
  task: Task
  isSelected: boolean
  isCollapsed: boolean
  hasChildren: boolean
  onSelect: (task: Task) => void
  onToggleCollapse: (taskId: string) => void
  onEdit: (task: Task) => void
  onCreateSubtask?: (parentTaskId: string) => void
  level?: number
  dragOverId?: string | null
  dropPosition?: 'before' | 'on' | null | undefined
}

interface TaskItemPresentationalProps {
  task: Task
  isSelected: boolean
  hasChildren: boolean
  isCollapsed: boolean
  level?: number
  isDragging?: boolean
  isOver?: boolean
  isHovered?: boolean
  dragOverId?: string | null
  dropPosition?: 'before' | 'on' | null | undefined
  onToggleCollapse?: (e: React.MouseEvent) => void
  onCreateSubtask?: (e: React.MouseEvent) => void
}

// Presentational component (no hooks) - used in DragOverlay
export const TaskItemPresentational = forwardRef<HTMLDivElement, TaskItemPresentationalProps>(
  ({ task, isSelected, hasChildren, isCollapsed, level = 0, isDragging = false, isOver = false, isHovered = false, dragOverId, dropPosition, onToggleCollapse, onCreateSubtask }, ref) => {
    const stateConfig = STATE_CONFIGS[task.state]
    const StateIcon = stateConfig.icon

    const isDragTarget = dragOverId === task.id
    const showInsertLine = isDragTarget && dropPosition === 'before'
    const showMakeSubtask = isDragTarget && dropPosition === 'on'

    return (
      <div className="relative" style={{ minHeight: '4px' }}>
        {/* Insertion line for reordering */}
        {showInsertLine && (
          <div
            className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
            style={{
              top: '-3px',
              zIndex: 50,
              height: '4px',
              background: 'var(--color-primary, #df1c26)',
              boxShadow: '0 0 8px var(--color-primary-glow, rgba(223, 28, 38, 0.6))',
              borderRadius: '2px'
            }}
          />
        )}

        <div
          ref={ref}
          className={cn(
            'group flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200',
            'cursor-grab active:cursor-grabbing',
            'hover:bg-omni-text/5',
            isSelected && 'bg-omni-primary/10 ring-1 ring-omni-primary/30',
            isHovered && 'bg-omni-text/5',
            isDragging && 'opacity-40 scale-95',
            isOver && 'ring-2 ring-omni-primary bg-omni-primary/5 scale-[1.02]',
            showMakeSubtask && 'ring-2 ring-omni-accent bg-omni-accent/10 scale-[1.02]',
            'focus:outline-none focus:ring-2 focus:ring-omni-primary/50'
          )}
          style={{ paddingLeft: `${12 + level * 24}px` }}
        >
        {/* Collapse/Expand Button */}
        {hasChildren ? (
          <button
            onClick={onToggleCollapse}
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
              onClick={onCreateSubtask}
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
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-omni-primary" />
        )}
      </div>
    </div>
    )
  }
)

TaskItemPresentational.displayName = 'TaskItemPresentational'

function TaskItemComponent({
  task,
  isSelected,
  isCollapsed,
  hasChildren,
  onSelect,
  onToggleCollapse,
  onEdit,
  onCreateSubtask,
  level = 0,
  dragOverId,
  dropPosition
}: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Make this task draggable
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

  // Make this task droppable (can receive other tasks as subtasks)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
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

  const handleClick = useCallback(() => {
    onSelect(task)
  }, [task, onSelect])

  const handleToggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      onToggleCollapse(task.id)
    }
  }, [task.id, hasChildren, onToggleCollapse])

  const handleDoubleClick = useCallback(() => {
    onEdit(task)
  }, [task, onEdit])

  const handleCreateSubtask = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onCreateSubtask?.(task.id)
  }, [task.id, onCreateSubtask])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        onEdit(task)
        break
      case ' ':
        e.preventDefault()
        onSelect(task)
        break
      case 'ArrowRight':
        e.preventDefault()
        if (hasChildren && isCollapsed) {
          onToggleCollapse(task.id)
        }
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (!isCollapsed && hasChildren) {
          onToggleCollapse(task.id)
        }
        break
    }
  }, [task, hasChildren, isCollapsed, onEdit, onSelect, onToggleCollapse])

  return (
    <div
      id={`task-${task.id}`}
      data-task-id={task.id}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="treeitem"
      aria-expanded={hasChildren ? !isCollapsed : undefined}
      aria-selected={isSelected}
    >
      <TaskItemPresentational
        task={task}
        isSelected={isSelected}
        hasChildren={hasChildren}
        isCollapsed={isCollapsed}
        level={level}
        isDragging={isDragging}
        isOver={isOver}
        isHovered={isHovered}
        dragOverId={dragOverId}
        dropPosition={dropPosition}
        onToggleCollapse={handleToggleCollapse}
        onCreateSubtask={onCreateSubtask ? handleCreateSubtask : undefined}
      />
    </div>
  )
}

// Memoize TaskItem to prevent unnecessary re-renders
export const TaskItem = memo(TaskItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.state === nextProps.task.state &&
    prevProps.task.progress === nextProps.task.progress &&
    prevProps.task.description === nextProps.task.description &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isCollapsed === nextProps.isCollapsed &&
    prevProps.hasChildren === nextProps.hasChildren &&
    prevProps.level === nextProps.level &&
    prevProps.onCreateSubtask === nextProps.onCreateSubtask &&
    prevProps.dragOverId === nextProps.dragOverId &&
    prevProps.dropPosition === nextProps.dropPosition
  )
})

TaskItem.displayName = 'TaskItem'
