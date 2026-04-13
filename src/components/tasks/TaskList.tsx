import { DragMoveEvent } from '@dnd-kit/core'
import { TaskDropZone } from './TaskDropZone'
import type { Task } from '@/types/task'

interface TaskListProps {
  tasks: Task[]              // Already-filtered tasks for this level
  allTasks: Task[]           // Full array for filtering children
  selectedTaskId: string | null
  collapsedTasks: Set<string>
  level: number
  onTaskSelect: (task: Task) => void
  onTaskToggleCollapse: (taskId: string) => void
  onTaskEdit: (task: Task) => void
  onTaskMove: (taskId: string, zone: 'subtask' | 'before' | 'after', targetTaskId: string) => void
  onTaskMoveUp?: (taskId: string) => void
  onTaskMoveDown?: (taskId: string) => void
  onTaskComeBack?: (taskId: string) => void
  onSubtaskCreate?: (parentTaskId: string) => void
  onDragMove: (event: DragMoveEvent, setCurrentOverZone: (zone: { taskId: string; zone: 'subtask' | 'before' | 'after' } | null) => void) => void
  currentOverZone: { taskId: string; zone: 'subtask' | 'before' | 'after' } | null
  setCurrentOverZone: (zone: { taskId: string; zone: 'subtask' | 'before' | 'after' } | null) => void
}

export function TaskList({
  tasks,
  allTasks,
  selectedTaskId,
  collapsedTasks,
  onTaskSelect,
  onTaskToggleCollapse,
  onTaskEdit,
  onTaskMove,
  onTaskMoveUp,
  onTaskMoveDown,
  onTaskComeBack,
  onSubtaskCreate,
  level = 0,
  onDragMove,
  currentOverZone,
  setCurrentOverZone
}: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return null
  }

  return (
    <div className="space-y-1">
      {tasks?.map(task => {
        const isCollapsed = collapsedTasks.has(task.id)
        const hasChildren = task.hasChildren

        const subtasks = allTasks.filter(t => t.parentId === task.id)

        const isOver = currentOverZone?.taskId === task.id

        return (
          <div key={task.id}>
            <TaskDropZone
              task={task}
              isSelected={selectedTaskId === task.id}
              isCollapsed={isCollapsed}
              hasChildren={hasChildren}
              onSelect={onTaskSelect}
              onToggleCollapse={onTaskToggleCollapse}
              onEdit={onTaskEdit}
              onCreateSubtask={onSubtaskCreate ? (taskId: string) => {
                onSubtaskCreate(taskId)
              } : undefined}
              onTaskMoveUp={onTaskMoveUp}
              onTaskMoveDown={onTaskMoveDown}
              onTaskComeBack={onTaskComeBack}
              level={level}
              dragOverZone={isOver ? currentOverZone.zone : null}
            />

            {!isCollapsed && hasChildren && subtasks.length > 0 && (
              <TaskList
                tasks={subtasks.sort((a, b) => a.order - b.order)}
                allTasks={allTasks}
                selectedTaskId={selectedTaskId}
                collapsedTasks={collapsedTasks}
                onTaskSelect={onTaskSelect}
                onTaskToggleCollapse={onTaskToggleCollapse}
                onTaskEdit={onTaskEdit}
                onTaskMove={onTaskMove}
                onTaskMoveUp={onTaskMoveUp}
                onTaskMoveDown={onTaskMoveDown}
                onTaskComeBack={onTaskComeBack}
                onSubtaskCreate={onSubtaskCreate}
                level={level + 1}
                onDragMove={onDragMove}
                currentOverZone={currentOverZone}
                setCurrentOverZone={setCurrentOverZone}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export { TaskListWrapper } from './TaskListWrapper'
