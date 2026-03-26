import { ZoomIn, Minimize2, Table2, Columns, ListTodo } from 'lucide-react'
import { useUIStore } from '@/store/ui'
import type { ViewMode } from '@/types/mindmap'
import { cn } from '@/utils/cn'

interface ViewModeOption {
  value: ViewMode
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}

const VIEW_MODES: ViewModeOption[] = [
  {
    value: 'mindmap-focus',
    icon: ZoomIn,
    label: 'Focus',
    description: 'Focused mindmap view'
  },
  {
    value: 'mindmap-panoramic',
    icon: Minimize2,
    label: 'Panoramic',
    description: 'Overview with minimap'
  },
  {
    value: 'kanban',
    icon: Columns,
    label: 'Kanban',
    description: 'Task board with drag-drop'
  },
  {
    value: 'tree-table',
    icon: Table2,
    label: 'Table',
    description: 'Hierarchical table view'
  },
  {
    value: 'task-list',
    icon: ListTodo,
    label: 'List',
    description: 'Advanced task list with filters'
  }
]

export function ViewModeSwitcher({ className }: { className?: string }) {
  const { viewMode, setViewMode } = useUIStore()

  return (
    <div className={cn('flex gap-1 bg-gray-800 rounded-lg p-1', className)}>
      {VIEW_MODES.map(({ value, icon: Icon, label, description }) => (
        <button
          key={value}
          onClick={() => setViewMode(value)}
          className={cn(
            'px-3 py-1.5 rounded flex items-center gap-2 text-sm transition-all',
            'hover:bg-gray-700',
            viewMode === value
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          )}
          title={description}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
