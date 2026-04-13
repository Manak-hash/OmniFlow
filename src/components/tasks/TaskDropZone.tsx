import { useDroppable } from '@dnd-kit/core'
import { ChevronUp, ChevronDown, CornerUpLeft } from 'lucide-react'
import { TaskItemContent } from './TaskItemContent'
import type { Task } from '@/types/task'

interface TaskDropZoneProps {
  task: Task
  isSelected: boolean
  isCollapsed: boolean
  hasChildren: boolean
  level: number
  dragOverZone?: 'subtask' | 'before' | 'after' | null
  onSelect: (task: Task) => void
  onToggleCollapse: (taskId: string) => void
  onEdit: (task: Task) => void
  onCreateSubtask?: (parentTaskId: string) => void
  onTaskMoveUp?: (taskId: string) => void
  onTaskMoveDown?: (taskId: string) => void
  onTaskComeBack?: (taskId: string) => void
}

export function TaskDropZone({
  task,
  isSelected,
  isCollapsed,
  hasChildren,
  onSelect,
  onToggleCollapse,
  onEdit,
  onCreateSubtask,
  onTaskMoveUp,
  onTaskMoveDown,
  onTaskComeBack,
  level = 0,
  dragOverZone
}: TaskDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  const isDragTarget = dragOverZone !== null
  const showSubtaskHint = isDragTarget && dragOverZone === 'subtask'

  return (
    <div
      ref={setNodeRef}
      data-task-id={task.id}
      className="relative transition-all duration-200 group/item"
      style={{
        paddingLeft: `${12 + level * 24}px`,
        marginLeft: level > 0 ? '8px' : '0'
      }}
    >
      {/* Subtle enhancement for subtask creation */}
      {showSubtaskHint && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            boxShadow: 'inset 0 0 0 1px rgba(59, 130, 246, 0.2)',
            zIndex: 1
          }}
        />
      )}

      {/* Visual connector line for subtasks */}
      {level > 0 && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-omni-text/20 pointer-events-none"
          style={{
            left: `${12 + (level - 1) * 24 + 12}px`,
            width: '2px'
          }}
        />
      )}

      {/* Up/Down arrows and Come Back button - positioned on right side, visible on hover */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 z-50">
        {/* Come back button - only shown for subtasks */}
        {task.parentId && onTaskComeBack && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTaskComeBack(task.id)
            }}
            className="p-1.5 rounded hover:bg-omni-primary/20 text-omni-text/30 hover:text-omni-primary transition-all cursor-pointer"
            title="Come back one level"
          >
            <CornerUpLeft className="w-3.5 h-3.5 pointer-events-none" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTaskMoveUp?.(task.id)
          }}
          className="p-1.5 rounded hover:bg-omni-text/10 text-omni-text/30 hover:text-omni-text transition-all cursor-pointer"
          title="Move up"
        >
          <ChevronUp className="w-3.5 h-3.5 pointer-events-none" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTaskMoveDown?.(task.id)
          }}
          className="p-1.5 rounded hover:bg-omni-text/10 text-omni-text/30 hover:text-omni-text transition-all cursor-pointer"
          title="Move down"
        >
          <ChevronDown className="w-3.5 h-3.5 pointer-events-none" />
        </button>
      </div>

      <TaskItemContent
        task={task}
        isSelected={isSelected}
        isCollapsed={isCollapsed}
        hasChildren={hasChildren}
        onSelect={onSelect}
        onToggleCollapse={onToggleCollapse}
        onEdit={onEdit}
        onCreateSubtask={onCreateSubtask}
        isOver={isOver}
        isDragTarget={isDragTarget}
        showMakeSubtask={showSubtaskHint}
      />
    </div>
  )
}
