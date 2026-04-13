import type { Task } from '@/types/task'
import { STATE_CONFIGS } from '@/constants/states'
import { cn } from '@/utils/cn'
import { useMemo, useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useTaskStore } from '@/store/taskStore'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCardPresentational } from './KanbanCard'
import { toast } from 'sonner'

interface KanbanBoardProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
  className?: string
}

export function KanbanBoard({ tasks, onEditTask, className }: KanbanBoardProps) {
  const searchQuery = useUIStore((state) => state.searchQuery)
  const updateTask = useTaskStore((state) => state.updateTask)
  const states: Array<Task['state']> = ['not-started', 'in-progress', 'blocked', 'done', 'failed']

  // Track active drag
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Filter tasks by search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks

    const searchLower = searchQuery.toLowerCase()
    return tasks.filter(task =>
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower)
    )
  }, [tasks, searchQuery])

  const getTasksByState = (state: Task['state']) => {
    return filteredTasks.filter(task => task.state === state)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || !overData) {
      setActiveTask(null)
      return
    }

    const draggedTask = tasks.find(t => t.id === active.id)

    if (!draggedTask) {
      setActiveTask(null)
      return
    }

    // Handle dropping on a column (change state and make it a root task)
    if (overData.type === 'column' && activeData.type === 'task') {
      const newState = overData.state
      const updates: { state?: Task['state']; parentId?: null } = {}

      // Change state if different
      if (draggedTask.state !== newState) {
        updates.state = newState
      }

      // Always make it a root task when dropped on column
      if (draggedTask.parentId !== null) {
        updates.parentId = null
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        updateTask(draggedTask.id, updates)
        const config = STATE_CONFIGS[newState as keyof typeof STATE_CONFIGS]
        toast.success(`Moved to ${config.label}`)
      }
    }

    // Handle dropping on a task (make subtask - no restrictions)
    if (overData.type === 'task' && activeData.type === 'task') {
      const overTask = tasks.find(t => t.id === over.id)

      if (overTask && draggedTask.id !== overTask.id) {
        // Check if already a child
        if (draggedTask.parentId === overTask.id) {
          setActiveTask(null)
          return
        }

        // Update the task to be a subtask (allow any nesting level)
        updateTask(draggedTask.id, { parentId: overTask.id })
        toast.success(`"${draggedTask.title}" is now a subtask of "${overTask.title}"`)
      }
    }

    setActiveTask(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('flex gap-3 lg:gap-4 overflow-x-auto overflow-y-hidden pb-4', className)}>
        {states.map((state) => {
          const stateTasks = getTasksByState(state)

          return (
            <KanbanColumn
              key={state}
              state={state}
              tasks={stateTasks}
              onEditTask={onEditTask}
            />
          )
        })}
      </div>

      {/* Drag Overlay - shows what's being dragged */}
      <DragOverlay>
        {activeTask && <KanbanCardPresentational task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}
