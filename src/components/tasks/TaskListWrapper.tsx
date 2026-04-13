import { useMemo, useState } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { TaskList } from './TaskList'
import { DndContext, DragEndEvent, DragMoveEvent, useSensors, useSensor, PointerSensor } from '@dnd-kit/core'
import type { Task } from '@/types/task'

interface TaskListWrapperProps {
  projectId: string
  onEditTask: (task: Task) => void
}

export function TaskListWrapper({ projectId, onEditTask }: TaskListWrapperProps) {
  const allTasks = useTaskStore(state => state.tasks)
  const collapsedTasksMap = useTaskStore(state => state.collapsedTasks)
  const updateTask = useTaskStore(state => state.updateTask)

  // Filter tasks for this project - only root tasks (parentId === null), sorted by order
  const tasks = useMemo(() => {
    return allTasks
      .filter(t => t.projectId === projectId && t.parentId === null)
      .sort((a, b) => a.order - b.order)
  }, [allTasks, projectId])

  // Get collapsed tasks for this project
  const collapsedTasks = useMemo(() => {
    return collapsedTasksMap.get(projectId) || new Set<string>()
  }, [collapsedTasksMap, projectId])

  const selectedTaskId = useTaskStore(state => state.selectedTaskId)
  const setSelectedTask = useTaskStore(state => state.setSelectedTask)
  const toggleTaskCollapse = useTaskStore(state => state.toggleTaskCollapse)
  const moveTask = useTaskStore(state => state.moveTask)

  // State for tracking drag-over zone
  const [currentOverZone, setCurrentOverZone] = useState<{
    taskId: string
    zone: 'subtask' | 'before' | 'after'
  } | null>(null)

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task.id)
  }

  const handleTaskToggleCollapse = (taskId: string) => {
    toggleTaskCollapse(projectId, taskId)
  }

  const handleTaskEdit = onEditTask

  const handleTaskMove = (taskId: string, zone: 'subtask' | 'before' | 'after', targetTaskId: string) => {
    moveTask(taskId, zone, targetTaskId)
  }

  const handleTaskMoveUp = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId)
    if (!task) return

    const siblings = allTasks.filter(t => t.parentId === task.parentId)
      .sort((a, b) => a.order - b.order)

    const currentIndex = siblings.findIndex(t => t.id === taskId)
    if (currentIndex <= 0) return

    const previousTask = siblings[currentIndex - 1]

    updateTask(taskId, { order: previousTask.order })
    updateTask(previousTask.id, { order: task.order })
  }

  const handleTaskMoveDown = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId)
    if (!task) return

    const siblings = allTasks.filter(t => t.parentId === task.parentId)
      .sort((a, b) => a.order - b.order)

    const currentIndex = siblings.findIndex(t => t.id === taskId)
    if (currentIndex === -1 || currentIndex >= siblings.length - 1) return

    const nextTask = siblings[currentIndex + 1]

    updateTask(taskId, { order: nextTask.order })
    updateTask(nextTask.id, { order: task.order })
  }

  const handleTaskComeBack = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId)
    if (!task) return

    // If already a root task, nothing to do
    if (!task.parentId) return

    // Get the parent task
    const parentTask = allTasks.find(t => t.id === task.parentId)
    if (!parentTask) return

    // If parent is a root task, make this task a root task
    if (!parentTask.parentId) {
      updateTask(taskId, { parentId: null, depth: 0 })

      // Update old parent's hasChildren flag
      const stillHasChildren = allTasks.some(t => t.parentId === task.parentId && t.id !== taskId)
      if (parentTask.hasChildren !== stillHasChildren) {
        updateTask(parentTask.id, { hasChildren: stillHasChildren })
      }
      return
    }

    // Otherwise, make this task a child of its grandparent
    const grandparentId = parentTask.parentId
    updateTask(taskId, { parentId: grandparentId, depth: (parentTask.depth || 0) - 1 })

    // Update old parent's hasChildren flag
    const stillHasChildren = allTasks.some(t => t.parentId === task.parentId && t.id !== taskId)
    if (parentTask.hasChildren !== stillHasChildren) {
      updateTask(parentTask.id, { hasChildren: stillHasChildren })
    }

    // Update new parent's hasChildren flag
    const grandparent = allTasks.find(t => t.id === grandparentId)
    if (grandparent && !grandparent.hasChildren) {
      updateTask(grandparent.id, { hasChildren: true })
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const { over } = event

    // Check if hovering over a task
    if (over) {
      const overData = over.data.current as { type?: string; task?: Task }

      if (overData?.type === 'task' && overData.task) {
        setCurrentOverZone({
          taskId: overData.task.id,
          zone: 'subtask'
        })
        return
      }
    }

    // If not over anything specific, clear
    setCurrentOverZone(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setCurrentOverZone(null)
    const { active, over } = event

    if (!over) {
      return
    }

    const activeData = active.data.current as { type?: string; task?: Task }
    const draggedTask = activeData.task

    if (!draggedTask || draggedTask.id === over.id) {
      return
    }

    // Handle normal drop on another task
    if (currentOverZone && currentOverZone.zone === 'subtask') {
      moveTask(draggedTask.id, 'subtask', over.id as string)
    }
  }

  const handleDragMoveForTask = (event: DragMoveEvent, _setZone: (zone: { taskId: string; zone: 'subtask' | 'before' | 'after' } | null) => void) => {
    handleDragMove(event)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="relative h-full">
        {/* Task list */}
        <div className="px-8 pb-8">
          <TaskList
            tasks={tasks}
            allTasks={allTasks}
            selectedTaskId={selectedTaskId}
            collapsedTasks={collapsedTasks}
            onTaskSelect={handleTaskSelect}
            onTaskToggleCollapse={handleTaskToggleCollapse}
            onTaskEdit={handleTaskEdit}
            onTaskMove={handleTaskMove}
            onTaskMoveUp={handleTaskMoveUp}
            onTaskMoveDown={handleTaskMoveDown}
            onTaskComeBack={handleTaskComeBack}
            level={0}
            onDragMove={handleDragMoveForTask}
            currentOverZone={currentOverZone}
            setCurrentOverZone={setCurrentOverZone}
          />
        </div>
      </div>
    </DndContext>
  )
}
