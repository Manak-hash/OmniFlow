import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Task } from '@/types/task'
import { Modal } from '@/components/ui/Modal'
import { TaskForm } from './TaskForm'
import { cn } from '@/utils/cn'

interface CreateTaskButtonProps {
  projectId: string
  parentId?: string | null
  onCreate?: (task: Task) => void
  className?: string
  isOpen?: boolean  // External control
  onOpenChange?: (open: boolean) => void  // Callback when modal should close
}

export function CreateTaskButton({
  projectId,
  parentId = null,
  onCreate,
  className,
  isOpen: externalIsOpen,
  onOpenChange
}: CreateTaskButtonProps) {
  const [internalIsOpen, setIsOpen] = useState(false)

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen

  const setOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open)
    } else {
      setIsOpen(open)
    }
  }

  const handleCreate = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'hasChildren' | 'depth' | 'order'>) => {
    // Don't close modal - let parent decide when to close
    onCreate?.(taskData as any)
  }

  // Only show the button if this is not a subtask creation
  const showButton = parentId === null

  return (
    <>
      {showButton && (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 bg-omni-primary hover:bg-omni-primary/90',
            'text-white font-medium rounded-lg transition-colors',
            'shadow-lg shadow-omni-primary/20',
            className
          )}
        >
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setOpen(false)
          // Signal completion without creating task
          onCreate?.(null as any)
        }}
        title={parentId ? "Create Subtask" : "Create New Task"}
      >
        <TaskForm
          projectId={projectId}
          parentId={parentId}
          onSubmit={handleCreate}
          onCancel={() => {
            setOpen(false)
            onCreate?.(null as any) // Signal that modal was closed
          }}
        />
      </Modal>
    </>
  )
}
