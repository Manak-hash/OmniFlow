import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { Task } from '@/types/task'
import { TaskEditor } from './TaskEditor'
import { useUIStore } from '@/store/uiStore'
import { useTaskStore } from '@/store/taskStore'
import { cn } from '@/utils/cn'

interface EditPanelProps {
  className?: string
}

export function EditPanel({ className }: EditPanelProps) {
  const isEditPanelOpen = useUIStore((state) => state.isEditPanelOpen)
  const editingTaskId = useUIStore((state) => state.editingTaskId)
  const closeEditPanel = useUIStore((state) => state.closeEditPanel)
  const updateTask = useTaskStore((state) => state.updateTask)
  const getTask = useTaskStore((state) => state.getTask)

  const task = editingTaskId ? getTask(editingTaskId) : null

  // Handle ESC key to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditPanelOpen) {
        closeEditPanel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isEditPanelOpen, closeEditPanel])

  const handleSave = (changes: Partial<Task>) => {
    if (!editingTaskId) return

    try {
      updateTask(editingTaskId, changes)
      closeEditPanel()
    } catch (error) {
      console.error('Failed to save task:', error)
      // TODO: Show error toast
    }
  }

  const handleCancel = () => {
    closeEditPanel()
  }

  return (
    <AnimatePresence>
      {isEditPanelOpen && task && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEditPanel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-omni-bg border-l border-omni-text/10 shadow-2xl z-50',
              'flex flex-col',
              className
            )}
          >
            {/* Close Button */}
            <button
              onClick={closeEditPanel}
              className="absolute top-4 right-4 p-2 hover:bg-omni-text/10 rounded-lg transition-colors z-10"
              aria-label="Close panel"
            >
              <X className="w-5 h-5 text-omni-text/50" />
            </button>

            {/* Task Editor */}
            <TaskEditor
              task={task}
              onSave={handleSave}
              onCancel={handleCancel}
              className="h-full"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
