import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectStore } from '@/store/projectStore'
import { useTaskStore } from '@/store/taskStore'
import { useUIStore } from '@/store/uiStore'
import { TaskListWrapper } from '@/components/tasks/TaskList'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { EditPanel } from '@/components/tasks/EditPanel'
import { CreateTaskButton } from '@/components/tasks/CreateTaskButton'
import { MobileNav } from '@/components/layout/MobileNav'
import { KeyboardShortcutsHelp } from '@/components/help/KeyboardShortcutsHelp'
import { Modal } from '@/components/ui/Modal'
import { SearchInput } from '@/components/tasks/SearchInput'
import { ChevronRight, Home, List, Columns, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { toast } from 'sonner'
import type { Task } from '@/types/task'
import { cn } from '@/utils/cn'

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>()

  // Store hooks
  const getProjectBySlug = useProjectStore((state) => state.getProjectBySlug)
  const createTask = useTaskStore((state) => state.createTask)
  const tasks = useTaskStore((state) => state.tasks) // Subscribe to tasks array for reactivity
  const openEditPanel = useUIStore((state) => state.openEditPanel)
  const closeEditPanel = useUIStore((state) => state.closeEditPanel)
  const viewMode = useUIStore((state) => state.viewMode)
  const setViewMode = useUIStore((state) => state.setViewMode)
  const isHelpOpen = useUIStore((state) => state.isHelpOpen)
  const openHelp = useUIStore((state) => state.openHelp)
  const closeHelp = useUIStore((state) => state.closeHelp)

  // Get project data
  const project = useMemo(() => {
    if (!slug) return null
    return getProjectBySlug(slug)
  }, [slug, getProjectBySlug])

  // Get tasks for this project (all tasks, not just root) - reactive
  const allTasks = useMemo(() => {
    if (!project) return []
    return tasks.filter(task => task.projectId === project.id)
  }, [project, tasks])

  // Get all tasks for Kanban view (show all tasks, including subtasks)
  const allTasksForKanban = useMemo(() => {
    if (!project) return []
    return tasks.filter(
      (t: Task) => t.projectId === project.id
    )
  }, [project, tasks])

  // Handle 404 - project not found
  useEffect(() => {
    if (slug && !project) {
      // Project not found - will show 404 UI
    }
  }, [slug, project])

  // Handle edit task
  const handleEditTask = (task: Task) => {
    openEditPanel(task.id)
  }

  // Handle create task
  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'hasChildren' | 'depth'>) => {
    if (!project) {
      toast.error('Cannot create task: No project selected')
      return
    }

    try {
      const newTask = createTask({
        ...taskData,
        projectId: project.id
      })
      toast.success(`Task "${newTask.title}" created successfully`)
    } catch (error) {
      toast.error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Handle view mode toggle
  const handleViewModeChange = (mode: 'list' | 'kanban') => {
    setViewMode(mode)
    toast.success(`Switched to ${mode} view`)
  }

  // Handle help
  const handleShowHelp = () => {
    openHelp()
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: () => {
      // Trigger create task button
      const createButton = document.querySelector('[data-testid="create-task-button"]') as HTMLButtonElement
      createButton?.click()
    },
    onEdit: () => {
      // Edit first selected task or show message
      const selectedTaskId = useUIStore.getState().editingTaskId
      if (selectedTaskId) {
        // Already editing
        return
      }
      toast.info('Select a task first to edit (Click on task)')
    },
    onClose: () => {
      closeEditPanel()
    },
    onShowHelp: handleShowHelp,
    onSearch: () => {
      // Search input auto-focuses on Ctrl+K (handled in SearchInput component)
    },
    onListView: () => {
      setViewMode('list')
      toast.success('Switched to list view')
    },
    onKanbanView: () => {
      setViewMode('kanban')
      toast.success('Switched to kanban view')
    }
  })

  // 404 - Project not found
  if (slug && !project) {
    return (
      <div className="min-h-screen bg-omni-bg flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-omni-bg-secondary flex items-center justify-center">
            <Home className="w-10 h-10 text-omni-text/30" />
          </div>
          <h1 className="text-2xl font-bold text-omni-text mb-2">Project Not Found</h1>
          <p className="text-omni-text-secondary mb-6">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-omni-primary hover:bg-omni-primary/90 text-white font-medium rounded-lg transition-colors shadow-lg shadow-omni-primary/20"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  // Loading or no project selected
  if (!project) {
    return (
      <div className="min-h-screen bg-omni-bg flex items-center justify-center">
        <div className="text-omni-text/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-omni-bg pb-safe lg:pb-0">
      {/* Breadcrumbs */}
      <div className="border-b border-omni-border bg-omni-bg-secondary/50 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 h-12 lg:h-14 text-sm">
            <Link
              to="/"
              className="flex items-center gap-1 text-omni-text-secondary hover:text-omni-text transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-omni-text-tertiary" />
            <span className="text-omni-text font-medium">{project.name}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-omni-border bg-omni-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-omni-text mb-2 truncate">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-omni-text-secondary line-clamp-2">{project.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* View mode toggle */}
              <div className="flex items-center bg-omni-bg-secondary rounded-lg p-1 border border-omni-border">
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={cn(
                    'p-1.5 sm:p-2 rounded transition-colors',
                    viewMode === 'list'
                      ? 'bg-omni-primary text-white'
                      : 'text-omni-text-secondary hover:text-omni-text'
                  )}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange('kanban')}
                  className={cn(
                    'p-1.5 sm:p-2 rounded transition-colors',
                    viewMode === 'kanban'
                      ? 'bg-omni-primary text-white'
                      : 'text-omni-text-secondary hover:text-omni-text'
                  )}
                  title="Kanban view"
                >
                  <Columns className="w-4 h-4" />
                </button>
              </div>

              {/* Create task button */}
              {project && (
                <CreateTaskButton
                  projectId={project.id}
                  onCreate={handleCreateTask}
                  className="touch-target"
                  data-testid="create-task-button"
                />
              )}

              {/* Help button - hide on very small screens */}
              <button
                onClick={openHelp}
                className="hidden sm:block p-2 rounded-lg hover:bg-omni-text/10 transition-colors touch-target"
                aria-label="Keyboard shortcuts"
              >
                <HelpCircle className="w-5 h-5 text-omni-text-secondary" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-3 sm:mt-4 max-w-md">
            <SearchInput />
          </div>

          {/* Stats - Responsive wrapping */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-omni-text-secondary">Total:</span>
              <span className="font-medium text-omni-text">{allTasksForKanban.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-omni-text-secondary">In progress:</span>
              <span className="font-medium text-omni-text">
                {allTasks.filter((t: Task) => t.state === 'in-progress').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-omni-text-secondary">Completed:</span>
              <span className="font-medium text-omni-text">
                {allTasks.filter((t: Task) => t.state === 'done').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 pb-24 lg:pb-6">
        {viewMode === 'list' ? (
          <TaskListWrapper
            projectId={project?.id}
            onEditTask={handleEditTask}
          />
        ) : (
          <KanbanBoard
            tasks={allTasksForKanban}
            onEditTask={handleEditTask}
            className="min-h-[400px] lg:min-h-[600px]"
          />
        )}
      </div>

      {/* Edit Panel */}
      <EditPanel />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={closeHelp}
        title=""
      >
        <KeyboardShortcutsHelp />
      </Modal>
    </div>
  )
}
