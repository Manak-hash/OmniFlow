import { useState, useEffect } from 'react'
import { Calendar, Save, X, Link2, Unlink } from 'lucide-react'
import type { Task } from '@/types/task'
import { MarkdownEditor } from './MarkdownEditor'
import { TaskStateSelector } from './TaskStateSelector'
import { cn } from '@/utils/cn'
import { useTaskStore } from '@/store/taskStore'

interface TaskEditorProps {
  task: Task
  onSave: (changes: Partial<Task>) => void
  onCancel: () => void
  className?: string
}

export function TaskEditor({ task, onSave, onCancel, className }: TaskEditorProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [state, setState] = useState(task.state)
  const [dueDate, setDueDate] = useState(task.dueDate || '')
  const [hasChanges, setHasChanges] = useState(false)

  const getTask = useTaskStore((state) => state.getTask)
  const parentTask = task.parentId ? getTask(task.parentId) : null

  // Track changes
  useEffect(() => {
    const changed =
      title !== task.title ||
      description !== task.description ||
      state !== task.state ||
      dueDate !== (task.dueDate || '')
    setHasChanges(changed)
  }, [title, description, state, dueDate, task])

  const handleSave = () => {
    if (!hasChanges) return

    const changes: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      state,
      dueDate: dueDate || undefined
    }

    onSave(changes)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    } else if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div
      className={cn('flex flex-col h-full', className)}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-omni-text/10">
        <h2 className="text-lg font-bold text-omni-text">Edit Task</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm font-medium text-omni-text/70 hover:text-omni-text hover:bg-omni-text/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-3 py-1.5 text-sm font-medium text-white bg-omni-primary hover:bg-omni-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-omni-text/70 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-4 py-2 bg-omni-bg/30 border border-omni-text/10 rounded-lg text-omni-text placeholder:text-omni-text/30 focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
            autoFocus
          />
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

        {/* Parent Task Info */}
        {parentTask && (
          <div className="p-3 bg-omni-bg/30 border border-omni-text/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-omni-text/50" />
                <div>
                  <p className="text-xs text-omni-text/50">Subtask of</p>
                  <p className="text-sm font-medium text-omni-text">{parentTask.title}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onSave({ parentId: null })
                  // Update local state to reflect change
                  setHasChanges(false)
                }}
                className="px-3 py-1.5 text-xs font-medium text-omni-text/70 hover:text-omni-text hover:bg-omni-text/10 rounded-lg transition-colors flex items-center gap-1"
                title="Make this a root task (remove parent)"
              >
                <Unlink className="w-3 h-3" />
                Unlink
              </button>
            </div>
          </div>
        )}

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
        <div className="flex-1 min-h-0">
          <label className="block text-sm font-medium text-omni-text/70 mb-2">
            Description
          </label>
          <div className="h-96">
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              placeholder="Add a description..."
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-omni-text/10 bg-omni-text/5">
        <div className="flex items-center justify-between text-xs text-omni-text/50">
          <div>
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </div>
          <div>
            Updated: {new Date(task.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}
