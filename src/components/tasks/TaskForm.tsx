import { useState, useMemo } from 'react'
import { Calendar, Check } from 'lucide-react'
import type { Task } from '@/types/task'
import { TaskStateSelector } from './TaskStateSelector'
import { cn } from '@/utils/cn'
import { validateTask } from '@/utils/validation'
import { useTaskStore } from '@/store/taskStore'

interface TaskFormProps {
  projectId: string
  parentId?: string | null
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'hasChildren' | 'depth' | 'order'>) => void
  onCancel: () => void
  className?: string
}

export function TaskForm({
  projectId,
  parentId = null,
  onSubmit,
  onCancel,
  className
}: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [state, setState] = useState<Task['state']>('not-started')
  const [dueDate, setDueDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get all tasks for validation
  const tasks = useTaskStore((state) => state.tasks)
  const allTasks = useMemo(() => Array.from(tasks.values()), [tasks])

  const validateForm = () => {
    const taskData: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      state,
      dueDate: dueDate || undefined,
      projectId,
      parentId,
      progress: 0,
      hasChildren: false,
      depth: 0,
      createdAt: '',
      updatedAt: '',
      stateHistory: []
    }

    const validation = validateTask(taskData as Task, allTasks)

    if (!validation.valid) {
      const errorMap: Record<string, string> = {}
      validation.errors.forEach((error) => {
        const field = error.split(':')[0].toLowerCase()
        errorMap[field] = error
      })
      setErrors(errorMap)
      return false
    }

    setErrors({})
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      state,
      dueDate: dueDate || undefined,
      projectId,
      parentId,
      stateHistory: [],
      tags: [],
      references: []
    }

    onSubmit(taskData)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-omni-text/70 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          className={cn(
            'w-full px-4 py-2 bg-omni-bg/30 border rounded-lg text-omni-text placeholder:text-omni-text/30 focus:outline-none focus:ring-2',
            errors.title ? 'border-red-500 focus:ring-red-500/50' : 'border-omni-text/10 focus:ring-omni-primary/50'
          )}
          autoFocus
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-400">{errors.title}</p>
        )}
      </div>

      {/* State */}
      <div>
        <label className="block text-sm font-medium text-omni-text/70 mb-2">
          State
        </label>
        <TaskStateSelector
          value={state}
          onChange={setState}
          size="md"
        />
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-omni-text/70 mb-2">
          Due Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-omni-bg/30 border border-omni-text/10 rounded-lg text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-omni-text/30" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-omni-text/70 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={4}
          className="w-full px-4 py-2 bg-omni-bg/30 border border-omni-text/10 rounded-lg text-omni-text placeholder:text-omni-text/30 focus:outline-none focus:ring-2 focus:ring-omni-primary/50 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-omni-text/10">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-omni-text/70 hover:text-omni-text hover:bg-omni-text/10 rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex-1 px-4 py-2 bg-omni-primary hover:bg-omni-primary/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Create Task
        </button>
      </div>
    </form>
  )
}
