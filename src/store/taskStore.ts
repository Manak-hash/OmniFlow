import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TaskStore as ITaskStore } from '@/types/store'
import type { Task } from '@/types/task'
import { calculateTaskProgress } from '@/utils/progress'
import { validateTask } from '@/utils/validation'

/**
 * Zustand store for task management with persistence
 * Implements cascade delete, progress recalculation, and validation
 */

// Helper function to serialize nested Map
const serializeCollapsedMap = (map: Map<string, Set<string>>) =>
  Array.from(map.entries()).map(([key, set]) => [key, Array.from(set)])

// Helper function to deserialize nested Map
const deserializeCollapsedMap = (entries: [string, string[]][]) =>
  new Map(entries.map(([key, set]) => [key, new Set(set)]))

export const useTaskStore = create<ITaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      selectedTaskId: null,
      collapsedTasks: new Map<string, Set<string>>(),

      getTask: (id: string) => {
        const state = get()
        return state.tasks.find(t => t.id === id)
      },

      getTasksByProject: (projectId: string) => {
        const state = get()
        return state.tasks.filter(t => t.projectId === projectId)
      },

      getTasksByParent: (parentId: string) => {
        const state = get()
        return state.tasks.filter(t => t.parentId === parentId)
      },

      getRootTasks: (projectId: string) => {
        const state = get()
        return state.tasks.filter(
          t => t.projectId === projectId && t.parentId === null
        )
      },

      createTask: (taskData) => {
        const state = get()
        const now = new Date().toISOString()
        const id = crypto.randomUUID()

        // Calculate order - place at end of siblings
        const siblings = state.tasks.filter(
          t => t.parentId === taskData.parentId && t.projectId === taskData.projectId
        )
        const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(t => t.order)) : -1
        const order = maxOrder + 1

        const newTask: Task = {
          ...taskData,
          id,
          order,
          createdAt: now,
          updatedAt: now,
          progress: 0,
          hasChildren: false,
          depth: 0
        }

        // Calculate depth based on parent
        if (newTask.parentId) {
          const parent = state.tasks.find(t => t.id === newTask.parentId)
          if (parent) {
            newTask.depth = parent.depth + 1
          }
        }

        // Validate the new task
        const validation = validateTask(newTask, state.tasks)
        if (!validation.valid) {
          throw new Error(`Invalid task: ${validation.errors.join(', ')}`)
        }

        // Calculate progress
        newTask.progress = calculateTaskProgress(newTask, state.tasks)

        // Update parent's hasChildren flag
        let newTasks = [...state.tasks]
        if (newTask.parentId) {
          const parentIndex = newTasks.findIndex(t => t.id === newTask.parentId)
          if (parentIndex !== -1) {
            newTasks[parentIndex] = { ...newTasks[parentIndex], hasChildren: true }
          }
        }

        newTasks.push(newTask)
        set({ tasks: newTasks })

        return newTask
      },

      updateTask: (id: string, changes: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
        const state = get()
        const existingIndex = state.tasks.findIndex(t => t.id === id)
        const existing = state.tasks[existingIndex]

        if (!existing) {
          throw new Error(`Task with id ${id} not found`)
        }

        const updated: Task = {
          ...existing,
          ...changes,
          id, // Ensure ID cannot be changed
          updatedAt: new Date().toISOString()
        }

        // Recalculate depth when parentId changes
        if (changes.parentId !== undefined && changes.parentId !== existing.parentId) {
          if (changes.parentId) {
            // Has a new parent - calculate depth based on parent
            const newParent = state.tasks.find(t => t.id === changes.parentId)
            if (newParent) {
              updated.depth = newParent.depth + 1
            }
          } else {
            // Becoming a root task - reset depth
            updated.depth = 0
          }
        }

        // Validate the updated task
        const validation = validateTask(updated, state.tasks)
        if (!validation.valid) {
          throw new Error(`Invalid task: ${validation.errors.join(', ')}`)
        }

        // Recalculate progress
        updated.progress = calculateTaskProgress(updated, state.tasks)

        const newTasks = [...state.tasks]
        newTasks[existingIndex] = updated

        // Handle parentId changes - update hasChildren flags and recalculate depths
        if (changes.parentId !== undefined && changes.parentId !== existing.parentId) {
          // New parent: set hasChildren = true
          if (changes.parentId) {
            const newParentIndex = newTasks.findIndex(t => t.id === changes.parentId)
            if (newParentIndex !== -1 && !newTasks[newParentIndex].hasChildren) {
              newTasks[newParentIndex] = { ...newTasks[newParentIndex], hasChildren: true }
            }
          }

          // Old parent: check if it still has children
          if (existing.parentId) {
            const oldParentIndex = newTasks.findIndex(t => t.id === existing.parentId)
            if (oldParentIndex !== -1) {
              const siblings = newTasks.filter(
                t => t.parentId === existing.parentId && t.id !== id
              )
              const stillHasChildren = siblings.length > 0
              if (newTasks[oldParentIndex].hasChildren !== stillHasChildren) {
                newTasks[oldParentIndex] = { ...newTasks[oldParentIndex], hasChildren: stillHasChildren }
              }
            }
          }

          // Recalculate depth for all descendants
          const updateDescendantDepths = (taskId: string, newDepth: number) => {
            const children = newTasks.filter(t => t.parentId === taskId)
            children.forEach(child => {
              const childIndex = newTasks.findIndex(t => t.id === child.id)
              if (childIndex !== -1) {
                const updatedChild = { ...child, depth: newDepth + 1 }
                newTasks[childIndex] = updatedChild
                updateDescendantDepths(child.id, newDepth + 1)
              }
            })
          }

          updateDescendantDepths(id, updated.depth)
        }

        // Recalculate progress for all ancestors
        let currentTask = updated
        while (currentTask.parentId) {
          const parentIndex = newTasks.findIndex(t => t.id === currentTask.parentId)
          if (parentIndex === -1) break

          const parent = newTasks[parentIndex]
          const recalculatedProgress = calculateTaskProgress(parent, newTasks)
          const updatedParent = {
            ...parent,
            progress: recalculatedProgress,
            updatedAt: new Date().toISOString()
          }

          newTasks[parentIndex] = updatedParent
          currentTask = updatedParent
        }

        set({ tasks: newTasks })
      },

      deleteTask: (id: string) => {
        const state = get()
        const task = state.tasks.find(t => t.id === id)

        if (!task) {
          throw new Error(`Task with id ${id} not found`)
        }

        // Cascade delete: delete all descendants
        const tasksToDelete = new Set<string>([id])

        // Find all descendants recursively
        const findDescendants = (parentId: string) => {
          const children = state.tasks.filter(t => t.parentId === parentId)
          for (const child of children) {
            tasksToDelete.add(child.id)
            findDescendants(child.id)
          }
        }

        findDescendants(id)

        // Delete all tasks
        const newTasks = state.tasks.filter(t => !tasksToDelete.has(t.id))

        // Update parent's hasChildren flag if needed
        let finalTasks = newTasks
        if (task.parentId) {
          const parentIndex = newTasks.findIndex(t => t.id === task.parentId)
          if (parentIndex !== -1) {
            const hasChildren = newTasks.some(t => t.parentId === task.parentId)
            finalTasks = [...newTasks]
            finalTasks[parentIndex] = { ...finalTasks[parentIndex], hasChildren }
          }
        }

        set({ tasks: finalTasks })
      },

      recalculateProgress: (id: string) => {
        const state = get()
        const taskIndex = state.tasks.findIndex(t => t.id === id)
        const task = state.tasks[taskIndex]

        if (!task) {
          throw new Error(`Task with id ${id} not found`)
        }

        const recalculatedProgress = calculateTaskProgress(task, state.tasks)
        const updated = { ...task, progress: recalculatedProgress }

        const newTasks = [...state.tasks]
        newTasks[taskIndex] = updated

        // Recalculate for all ancestors
        let currentTask = updated
        while (currentTask.parentId) {
          const parentIndex = newTasks.findIndex(t => t.id === currentTask.parentId)
          if (parentIndex === -1) break

          const parent = newTasks[parentIndex]
          const parentProgress = calculateTaskProgress(parent, newTasks)
          const updatedParent = {
            ...parent,
            progress: parentProgress,
            updatedAt: new Date().toISOString()
          }

          newTasks[parentIndex] = updatedParent
          currentTask = updatedParent
        }

        set({ tasks: newTasks })
      },

      setSelectedTask: (taskId: string | null) => {
        set({ selectedTaskId: taskId })
      },

      toggleTaskCollapse: (projectId: string, taskId: string) => {
        const state = get()
        const projectCollapsed = state.collapsedTasks.get(projectId) || new Set()
        const newCollapsed = new Set(projectCollapsed)

        if (newCollapsed.has(taskId)) {
          newCollapsed.delete(taskId)
        } else {
          newCollapsed.add(taskId)
        }

        const newCollapsedTasks = new Map(state.collapsedTasks)
        newCollapsedTasks.set(projectId, newCollapsed)
        set({ collapsedTasks: newCollapsedTasks })
      },

      // Helper: Rebalance order numbers for siblings to prevent collisions
      rebalanceOrders: (parentId: string | null) => {
        const state = get()
        const siblings = state.tasks.filter(t => t.parentId === parentId)

        siblings.forEach((task, index) => {
          get().updateTask(task.id, { order: index * 1000 })
        })
      },

      // Helper: Check if sibling tasks have order numbers too close together
      hasOrderCollisions: (siblings: Task[]): boolean => {
        if (siblings.length < 2) return false

        const orders = siblings.map(t => t.order).sort((a, b) => a - b)
        for (let i = 1; i < orders.length; i++) {
          if (orders[i] - orders[i - 1] < 100) {
            return true
          }
        }
        return false
      },

      // Helper: Check if taskId is a descendant of ancestorId (prevents circular references)
      isDescendant: (taskId: string, ancestorId: string): boolean => {
        const state = get()
        if (taskId === ancestorId) return true

        const task = state.tasks.find(t => t.id === taskId)
        if (!task?.parentId) return false

        if (task.parentId === ancestorId) return true
        return get().isDescendant(task.parentId, ancestorId)
      },

      moveTask: (taskId: string, zone: 'subtask' | 'before' | 'after', targetTaskId: string) => {
        const state = get()
        const movedTask = state.tasks.find(t => t.id === taskId)

        // Handle making task a root task (empty targetTaskId)
        if (targetTaskId === '' || targetTaskId === 'root') {
          if (!movedTask) return

          // Get all root tasks for this project
          const rootTasks = state.tasks.filter(t => t.projectId === movedTask.projectId && t.parentId === null)
          const maxOrder = rootTasks.length > 0 ? Math.max(...rootTasks.map(t => t.order)) : -1

          // Update to make it a root task
          get().updateTask(taskId, {
            parentId: null,
            order: maxOrder + 1000,
            depth: 0
          })

          // Update old parent's hasChildren flag
          if (movedTask.parentId) {
            const oldParent = state.tasks.find(t => t.id === movedTask.parentId)
            if (oldParent) {
              const stillHasChildren = state.tasks.some(t => t.parentId === movedTask.parentId && t.id !== taskId)
              if (oldParent.hasChildren !== stillHasChildren) {
                get().updateTask(movedTask.parentId, { hasChildren: stillHasChildren })
              }
            }
          }

          return
        }

        // Normal move to another task
        const targetTask = state.tasks.find(t => t.id === targetTaskId)

        if (!movedTask || !targetTask) {
          console.warn('[TaskStore] moveTask: Task or target not found')
          return
        }

        if (zone === 'subtask') {
          // Make movedTask a child of targetTask
          const siblings = state.tasks.filter(t => t.parentId === targetTaskId)
          const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(t => t.order)) : -1

          // Update moved task
          get().updateTask(taskId, {
            parentId: targetTaskId,
            order: maxOrder + 1000,
            depth: targetTask.depth + 1
          })

          // Update parent's hasChildren flag
          if (!targetTask.hasChildren) {
            get().updateTask(targetTaskId, { hasChildren: true })
          }
        }

        else if (zone === 'before') {
          // Insert movedTask before targetTask
          const siblings = state.tasks.filter(t => t.parentId === targetTask.parentId)
          const targetOrder = targetTask.order

          // Check for collisions on existing siblings only (before the move)
          if (get().hasOrderCollisions(siblings)) {
            get().rebalanceOrders(targetTask.parentId)
          }

          get().updateTask(taskId, {
            parentId: targetTask.parentId,
            order: targetOrder - 500
          })
        }

        else if (zone === 'after') {
          // Insert movedTask after targetTask
          const siblings = state.tasks.filter(t => t.parentId === targetTask.parentId)
          const targetOrder = targetTask.order

          // Check for collisions on existing siblings only (before the move)
          if (get().hasOrderCollisions(siblings)) {
            get().rebalanceOrders(targetTask.parentId)
          }

          get().updateTask(taskId, {
            parentId: targetTask.parentId,
            order: targetOrder + 500
          })
        }
      }
    }),
    {
      name: 'omniflow-tasks',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        selectedTaskId: state.selectedTaskId,
        collapsedTasks: serializeCollapsedMap(state.collapsedTasks)
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        tasks: persistedState.tasks ?? currentState.tasks,
        selectedTaskId: persistedState.selectedTaskId ?? currentState.selectedTaskId,
        collapsedTasks: persistedState.collapsedTasks ? deserializeCollapsedMap(persistedState.collapsedTasks) : currentState.collapsedTasks
      })
    }
  )
)

// Selector hooks - these must be in a separate file or used properly
// Import these in your components:
// import { useProjectTasks, useCollapsedTasks } from '@/store/taskStore'

// Note: We don't use selectors that filter arrays because they create new references
// Instead, components should subscribe to the entire array and filter using useMemo
export const useProjectTasks = (projectId: string): Task[] => {
  return useTaskStore((state) => state.tasks.filter(t => t.projectId === projectId))
}

export const useCollapsedTasks = (projectId: string): Set<string> => {
  return useTaskStore((state) => {
    const collapsed = state.collapsedTasks.get(projectId)
    // Return the Set directly - Zustand will handle memoization
    return collapsed || new Set()
  })
}
